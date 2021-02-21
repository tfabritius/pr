import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { DefaultAuthGuard } from '../../auth/default-auth.guard'
import { PortfolioGuard } from '../portfolio.guard'
import { SecurityDto } from './securities.dto'
import { SecurityParams } from './security.params'
import { SecuritiesService } from './securities.service'
import { SecuritiesKpisService } from './securities.kpis.service'
import { PortfolioParams } from '../portfolio.params'
import { PortfolioSecurity } from './security.entity'

@Controller('portfolios/:portfolioId/securities')
@UseGuards(DefaultAuthGuard, PortfolioGuard)
@ApiTags('portfolios/securities')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiNotFoundResponse({ description: 'Portfolio or security not found' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class SecuritiesController {
  constructor(
    public securitiesService: SecuritiesService,
    private readonly kpisService: SecuritiesKpisService,
  ) {}

  /**
   * Creates security in portfolio
   */
  @Post()
  async create(
    @Param() params: PortfolioParams,
    @Body() securityDto: SecurityDto,
    @Req() req,
  ): Promise<PortfolioSecurity> {
    return this.securitiesService.create(req.portfolio, securityDto)
  }

  /**
   * Gets list of all securities of portfolio
   */
  @Get()
  async readAll(
    @Param() params: PortfolioParams,
  ): Promise<PortfolioSecurity[]> {
    return await this.securitiesService.getAll(params)
  }

  /**
   * Gets security
   */
  @Get(':securityId')
  async readOne(@Param() params: SecurityParams): Promise<PortfolioSecurity> {
    return await this.securitiesService.getOne(params)
  }

  /**
   * Updates security
   */
  @Put(':securityId')
  async update(
    @Param() params: SecurityParams,
    @Body() securityDto: SecurityDto,
  ): Promise<PortfolioSecurity> {
    return this.securitiesService.update(params, securityDto)
  }

  /**
   * Delets security
   */
  @Delete(':securityId')
  @HttpCode(204)
  async delete(@Param() params: SecurityParams) {
    await this.securitiesService.delete(params)
  }
}
