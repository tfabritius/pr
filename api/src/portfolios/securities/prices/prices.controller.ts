import {
  Body,
  Controller,
  Get,
  Param,
  ParseArrayPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { DefaultAuthGuard } from '../../../auth/default-auth.guard'
import { PortfolioGuard } from '../../portfolio.guard'
import { SecuritiesService } from '../securities.service'
import { SecurityParams } from '../security.params'
import { PortfolioSecurityPrice } from './price.entity'
import { SecurityPriceDto } from './prices.dto'
import { SecuritiesPricesService } from './prices.service'
import { PricesQuery } from './prices.query'

@Controller('portfolios/:portfolioId/securities/:securityId/prices')
@UseGuards(DefaultAuthGuard, PortfolioGuard)
@ApiTags('portfolios/securities')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiNotFoundResponse({ description: 'Portfolio or security not found' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class SecuritiesPricesController {
  constructor(
    public securitiesService: SecuritiesService,
    public pricesService: SecuritiesPricesService,
  ) {}

  @Patch()
  @ApiOperation({ summary: 'Create or update prices' })
  @ApiOkResponse({
    description: 'Prices have been successfully created or updated',
    type: PortfolioSecurityPrice,
    isArray: true,
  })
  @ApiBody({ type: SecurityPriceDto, isArray: true })
  async upsert(
    @Param()
    params: SecurityParams,

    @Body(new ParseArrayPipe({ items: SecurityPriceDto }))
    dtos: SecurityPriceDto[],
  ): Promise<PortfolioSecurityPrice[]> {
    const security = await this.securitiesService.getOne(params)
    return this.pricesService.upsert(security.id, dtos)
  }

  @Get()
  @ApiOperation({ summary: 'Get prices' })
  @ApiOkResponse({
    description: 'List of prices is returned',
    type: PortfolioSecurityPrice,
    isArray: true,
  })
  async readAll(
    @Param() params: SecurityParams,
    @Query() query: PricesQuery,
  ): Promise<PortfolioSecurityPrice[]> {
    const prices = await this.pricesService.getAll(params, query)
    return prices
  }
}
