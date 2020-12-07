import { Get, Controller, Param, Query } from '@nestjs/common'
import {
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger'

import { Currency } from './currency.entity'
import { ExchangeRate } from './exchangerate.entity'
import { CurrenciesService } from './currencies.service'
import { ExchangeRateParams } from './exchangerate.params'
import { ExchangeRateQuery } from './exchangerate.query'

@Controller('currencies')
@ApiTags('currencies')
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all currencies' })
  @ApiOkResponse({
    description: 'List of all currencies is returned.',
    type: Currency,
    isArray: true,
  })
  async readAll(): Promise<Currency[]> {
    return await this.currenciesService.getAllCurrencies()
  }

  @Get(':baseCurrencyCode/:quoteCurrencyCode')
  @ApiOperation({ summary: 'Get exchange rate' })
  @ApiOkResponse({
    description: 'The exchange rate is returned.',
    type: ExchangeRate,
  })
  @ApiNotFoundResponse({ description: 'Exchange rate not found' })
  async readOneExchangeRate(
    @Param() params: ExchangeRateParams,
    @Query() query: ExchangeRateQuery,
  ): Promise<ExchangeRate> {
    return await this.currenciesService.getOneExchangeRate(params, query)
  }
}
