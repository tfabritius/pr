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
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { DefaultAuthGuard } from '../../../auth/default-auth.guard'
import { PortfolioGuard } from '../../portfolio.guard'
import { PortfolioSecurityParams } from '../security.params'
import { PortfolioSecurityPrice } from './price.entity'
import { CreateUpdatePortfolioSecurityPriceDto } from '../../dto/CreateUpdatePortfolioSecurityPrice.dto'
import { PortfolioSecurityPricesService } from './prices.service'
import { PricesQuery } from './prices.query'

@Controller('portfolios/:portfolioId/securities/:securityUuid/prices')
@UseGuards(DefaultAuthGuard, PortfolioGuard)
@ApiTags('portfolios/securities')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiNotFoundResponse({ description: 'Portfolio or security not found' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class PortfolioSecurityPricesController {
  constructor(public portfolioSecurityPrices: PortfolioSecurityPricesService) {}

  /**
   * Creates or updates prices of security
   */
  @Patch()
  @ApiBody({ type: CreateUpdatePortfolioSecurityPriceDto, isArray: true })
  async upsert(
    @Param() params: PortfolioSecurityParams,
    @Body(new ParseArrayPipe({ items: CreateUpdatePortfolioSecurityPriceDto }))
    dtos: CreateUpdatePortfolioSecurityPriceDto[],
  ): Promise<PortfolioSecurityPrice[]> {
    return this.portfolioSecurityPrices.upsert(params, dtos)
  }

  /**
   * Gets list of prices of security
   */
  @Get()
  async readAll(
    @Param() params: PortfolioSecurityParams,
    @Query() query: PricesQuery,
  ): Promise<PortfolioSecurityPrice[]> {
    return await this.portfolioSecurityPrices.getAll(params, query)
  }
}
