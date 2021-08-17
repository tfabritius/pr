import { ObjectType } from '@nestjs/graphql'

@ObjectType()
export class SecurityMarket {
  securityUuid: string
  marketCode: string
  currencyCode: string
  firstPriceDate?: Date
  lastPriceDate?: Date
  symbol?: string
}
