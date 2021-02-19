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
  ApiOperation,
  ApiTags,
  ApiOkResponse,
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
import dayjs from 'dayjs'

@Controller('currencies')
@ApiTags('currencies')
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class CurrenciesController {
  constructor(
    private readonly currenciesService: CurrenciesService,
    private readonly currenciesConversionService: CurrenciesConversionService,
  ) {}

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
    type: Exchangerate,
  })
  @ApiNotFoundResponse({ description: 'Exchange rate not found' })
  async readOneExchangeRate(
    @Param() params: ExchangeRateParams,
    @Query() query: ExchangeRateQuery,
  ): Promise<Exchangerate> {
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

  @Post('convert')
  @HttpCode(200)
  @ApiOperation({ summary: 'Convert amount between currencies' })
  @ApiOkResponse({
    description: 'The converted amount is returned.',
  })
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
