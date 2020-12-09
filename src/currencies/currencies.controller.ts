import {
  Get,
  Controller,
  Param,
  Query,
  Post,
  HttpCode,
  UseGuards,
} from '@nestjs/common'
import {
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'

import { Currency } from './currency.entity'
import { ExchangeRate } from './exchangerate.entity'
import { CurrenciesService } from './currencies.service'
import { ExchangeRateParams } from './exchangerate.params'
import { ExchangeRateQuery } from './exchangerate.query'
import { DefaultAuthGuard } from '../auth/default-auth.guard'

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

  @Post('update')
  @HttpCode(200)
  @UseGuards(DefaultAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update currencies incl. exchange rate prices' })
  @ApiOkResponse({ description: 'Update has finished.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async update(): Promise<void> {
    return await this.currenciesService.updateExchangeRates()
  }
}
