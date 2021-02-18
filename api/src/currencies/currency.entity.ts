import { ObjectType } from '@nestjs/graphql'
import { ApiHideProperty } from '@nestjs/swagger'
import { ExchangeRate } from './exchangerate.entity'

@ObjectType()
export class Currency {
  code: string

  @ApiHideProperty()
  exchangeRatesBase: ExchangeRate[]

  @ApiHideProperty()
  exchangeRatesQuote: ExchangeRate[]
}
