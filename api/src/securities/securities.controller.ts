import {
  Get,
  Controller,
  UseGuards,
  Post,
  Body,
  Param,
  Delete,
  Put,
  NotFoundException,
  ParseArrayPipe,
  Query,
  Patch,
  Logger,
  Header,
  ParseUUIDPipe,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiBody,
} from '@nestjs/swagger'

import { AdminGuard } from '../auth/admin.guard'
import { DefaultAuthGuard } from '../auth/default-auth.guard'
import { PrismaService } from '../prisma.service'
import { CreateUpdateSecurityDto } from './dto/create.update.security.dto'
import { CreateUpdateSecurityMarketDto } from './dto/create.update.security.market.dto'
import { PublicSecurity } from './dto/public.security.dto'
import { SearchSecuritiesQueryDto } from './dto/search.securities.query.dto'
import { SecurityTaxonomyDto } from './dto/security.taxonomy.dto'
import { SecurityMarketsService } from './markets.service'
import { SecuritiesService } from './securities.service'
import { ParseLaxUUIDPipe } from '../utils/parse-lax-uuid.pipe'

@Controller('securities')
@ApiTags('securities')
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class SecuritiesController {
  private readonly logger = new Logger(SecuritiesController.name)

  constructor(
    private readonly securities: SecuritiesService,
    private readonly securityMarkets: SecurityMarketsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Gets list of securities
   */
  @Get('')
  @UseGuards(DefaultAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getAll(
    @Query('limit') queryLimit: string,
    @Query('skip') querySkip: string,
    @Query('sort') querySort: string,
    @Query('desc') queryDesc: string,
    @Query('search') querySearch: string,
    @Query('securityType') querySecurityType: string,
  ) {
    const limit = parseInt(String(queryLimit)) || 10
    const skip = parseInt(String(querySkip)) || 0
    const sort = String(querySort || 'name')
    const descending = queryDesc === 'true'
    const search = String(querySearch || '')
    const securityType = String(querySecurityType || '')

    const { entries, params } = await this.securities.getMany({
      limit,
      skip,
      sort,
      descending,
      search,
      securityType,
    })
    return {
      entries: entries.map(({ securityMarkets, ...security }) => ({
        ...security,
        markets: securityMarkets,
      })),
      params,
    }
  }

  /**
   * Gets security
   */
  @Get(':uuid')
  @UseGuards(DefaultAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getSecurity(@Param('uuid', ParseUUIDPipe) uuid: string) {
    const { securityMarkets, ...security } = await this.securities.getOne(uuid)

    return {
      ...security,
      uuid: security.uuid?.replace(/-/g, ''),
      markets: securityMarkets.map((m) => ({
        ...m,
        firstPriceDate: m.firstPriceDate?.toISOString().substring(0, 10),
        lastPriceDate: m.lastPriceDate?.toISOString().substring(0, 10),
      })),
    }
  }

  /**
   * Creates security
   */
  @Post('')
  @UseGuards(DefaultAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async createSecurity(@Body() dto: CreateUpdateSecurityDto) {
    return this.securities.create(dto)
  }

  /**
   * Updates security
   */
  @Patch(':uuid')
  @UseGuards(DefaultAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateSecurity(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: CreateUpdateSecurityDto,
  ) {
    await this.securities.getOne(uuid)
    return await this.securities.update(uuid, dto)
  }

  /**
   * Deletes security
   */
  @Delete(':uuid')
  @UseGuards(DefaultAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async deleteSecurity(@Param('uuid', ParseUUIDPipe) uuid: string) {
    await this.securities.getOne(uuid)
    return await this.securities.delete(uuid)
  }

  /**
   * Creates/updates market and prices
   */
  @Patch('/uuid/:uuid/markets/:marketCode')
  @UseGuards(DefaultAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async patchMarket(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Param('marketCode') marketCode: string,
    @Body() dto: CreateUpdateSecurityMarketDto,
  ) {
    await this.securities.getOne(uuid)
    return await this.securityMarkets.upsert(uuid, marketCode, dto)
  }

  /**
   * Deletes market (and prices)
   */
  @Delete('/uuid/:uuid/markets/:marketCode')
  @UseGuards(DefaultAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async deleteMarket(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Param('marketCode') marketCode: string,
  ) {
    await this.securities.getOne(uuid)
    return this.securityMarkets.delete(uuid, marketCode)
  }

  /**
   * Create/update/delete taxonomies
   */
  @Put('uuid/:uuid/taxonomies/:rootUuid')
  @ApiBody({ type: SecurityTaxonomyDto, isArray: true })
  @UseGuards(DefaultAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async putTaxonomies(
    @Param('uuid', ParseUUIDPipe) securityUuid: string,
    @Param('rootUuid', ParseUUIDPipe) rootUuid: string,
    @Body(new ParseArrayPipe({ items: SecurityTaxonomyDto }))
    dtos: SecurityTaxonomyDto[],
  ) {
    // Remove securityTaxonomies which are not present any more
    await this.prisma.securityTaxonomy.deleteMany({
      where: {
        securityUuid,
        taxonomy: { rootUuid },
        taxonomyUuid: { notIn: dtos.map((el) => el.taxonomyUuid) },
      },
    })

    const ret = []

    for (const { taxonomyUuid, weight } of dtos) {
      const securityTaxonomy = await this.prisma.securityTaxonomy.upsert({
        where: { taxonomyUuid_securityUuid: { securityUuid, taxonomyUuid } },
        create: { securityUuid, taxonomyUuid, weight },
        update: { weight },
      })
      ret.push(securityTaxonomy)
    }

    return ret
  }

  /**
   * Endpoint to update full text search index from current database content
   */
  @Post('/search/update')
  @UseGuards(DefaultAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateFts() {
    this.securities.updateFtsIndex()
    return { status: 'ok' }
  }

  /**
   * Searches for securities (public)
   */
  @Get('/search/:query')
  @Header('Cache-Control', 'max-age=600, public')
  async searchSecurities(
    @Param('query') query: string,
    @Query() { securityType }: SearchSecuritiesQueryDto,
  ): Promise<PublicSecurity[]> {
    return this.securities.searchFtsIndex(query, securityType)
  }

  /**
   * Gets security (public)
   */
  @Get('uuid/:uuid')
  @Header('Cache-Control', 'max-age=600, public')
  async getSecurityPublic(
    @Param('uuid', ParseLaxUUIDPipe) uuid: string,
  ): Promise<PublicSecurity> {
    const { securityMarkets, ...security } = await this.securities.getOnePublic(
      uuid,
    )

    return {
      ...security,
      uuid: security.uuid?.replace(/-/g, ''),
      markets: securityMarkets.map((m) => ({
        ...m,
        firstPriceDate: m.firstPriceDate?.toISOString().substring(0, 10),
        lastPriceDate: m.lastPriceDate?.toISOString().substring(0, 10),
      })),
    }
  }

  /**
   * Get security prices (public)
   */
  @Get('uuid/:uuid/markets/:marketCode')
  @Header('Cache-Control', 'max-age=600, public')
  async getPrices(
    @Param('uuid', ParseLaxUUIDPipe) uuid: string,
    @Param('marketCode') marketCode: string,
    @Query('from') from?: string,
  ) {
    function getDefaultFromDate() {
      const d = new Date()
      d.setDate(d.getDate() - 14) // 14 days in the past
      return d.toISOString().substring(0, 10)
    }

    const fromDate = typeof from === 'string' ? from : getDefaultFromDate()

    const market = await this.prisma.securityMarket.findFirst({
      where: { marketCode, security: { uuid } },
      select: {
        marketCode: true,
        currencyCode: true,
        firstPriceDate: true,
        lastPriceDate: true,
        symbol: true,
        prices: {
          select: { date: true, close: true },
          where: { date: { gte: fromDate + 'T00:00:00Z' } },
          orderBy: { date: 'asc' },
        },
      },
    })

    if (!market) {
      throw new NotFoundException('Market not found')
    }

    return {
      ...market,
      firstPriceDate: market.firstPriceDate?.toISOString().substring(0, 10),
      lastPriceDate: market.lastPriceDate?.toISOString().substring(0, 10),
      prices: market.prices?.map((p) => ({
        date: p.date.toISOString().substring(0, 10),
        close: Number(p.close),
      })),
    }
  }
}
