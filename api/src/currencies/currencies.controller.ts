import {
  Get,
  Controller,
  Param,
  Query,
  Post,
  HttpCode,
  UseGuards,
  Body,
  BadRequestException,
} from '@nestjs/common'
import {
  ApiTags,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { Prisma } from '@prisma/client'

import { CurrenciesService } from './currencies.service'
import {
  CurrenciesConversionService,
  CurrencyConversionError,
} from './currencies.conversion.service'
import { Currency } from './currency.entity'
import { Exchangerate } from './exchangerate.entity'
import { ExchangeRateParams } from './exchangerate.params'
import { ExchangeRateQuery } from './exchangerate.query'
import { DefaultAuthGuard } from '../auth/default-auth.guard'
import { ConvertCurrenciesDto } from './currencies.dto'

@Controller('currencies')
@ApiTags('currencies')
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class CurrenciesController {
  constructor(
    private readonly currenciesService: CurrenciesService,
    private readonly currenciesConversionService: CurrenciesConversionService,
  ) {}

  /**
   * Gets list of all available currencies and their exchange rates
   */
  @Get()
  async readAll(): Promise<Currency[]> {
    return await this.currenciesService.getAllCurrencies()
  }

  /**
   * Gets exchange rate incl. list of prices
   */
  @Get(':baseCurrencyCode/:quoteCurrencyCode')
  @ApiNotFoundResponse({ description: 'Exchange rate not found' })
  async readOneExchangeRate(
    @Param() params: ExchangeRateParams,
    @Query() query: ExchangeRateQuery,
  ): Promise<Exchangerate> {
    return await this.currenciesService.getOneExchangeRate(params, query)
  }

  /**
   * Triggers update of prices of exchange rates
   */
  @Post('update')
  @HttpCode(200)
  @UseGuards(DefaultAuthGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async update(): Promise<void> {
    return await this.currenciesService.updateExchangeRates()
  }

  /**
   * Converts amount between currencies
   */
  @Post('convert')
  @HttpCode(200)
  async convert(@Body() dto: ConvertCurrenciesDto): Promise<any> {
    try {
      const targetAmount = await this.currenciesConversionService.convertCurrencyAmount(
        new Prisma.Decimal(dto.sourceAmount),
        dto.sourceCurrencyCode,
        dto.targetCurrencyCode,
        dto.date,
      )

      return { ...dto, targetAmount: targetAmount.toString() }
    } catch (err) {
      if (err instanceof CurrencyConversionError) {
        throw new BadRequestException(err.message)
      } else {
        throw err
      }
    }
  }
}
