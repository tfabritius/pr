import { ObjectType } from '@nestjs/graphql'
import { ExchangeratePrice } from './price.entity'

@ObjectType()
export class Exchangerate {
  baseCurrencyCode: string
  quoteCurrencyCode: string
  latestPriceDate?: Date
  prices?: ExchangeratePrice[]
}
