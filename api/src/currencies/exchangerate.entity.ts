import { ObjectType } from '@nestjs/graphql'
import { ApiHideProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

import { Currency } from './currency.entity'
import { ExchangeRatePrice } from './price.entity'

@ObjectType()
export class ExchangeRate {
  @ApiHideProperty()
  @Exclude()
  id: number

  @ApiHideProperty()
  baseCurrency: Currency

  baseCurrencyCode: string

  @ApiHideProperty()
  quoteCurrency: Currency

  quoteCurrencyCode: string

  prices: ExchangeRatePrice[]

  latestPriceDate: string
}
