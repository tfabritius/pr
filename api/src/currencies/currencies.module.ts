import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Currency } from './currency.entity'
import { ExchangeRate } from './exchangerate.entity'
import { ExchangeRatePrice } from './price.entity'
import { CurrenciesService } from './currencies.service'
import { CurrenciesConversionService } from './currencies.conversion.service'
import { CurrenciesController } from './currencies.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([Currency, ExchangeRate, ExchangeRatePrice]),
  ],
  providers: [CurrenciesService, CurrenciesConversionService],
  controllers: [CurrenciesController],
  exports: [CurrenciesService, CurrenciesConversionService],
})
export class CurrenciesModule {}
