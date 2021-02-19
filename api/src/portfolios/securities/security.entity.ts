import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class PortfolioSecurity {
  @Field(() => Int)
  id: number

  name: string

  uuid: string

  currencyCode: string

  isin: string

  wkn: string

  symbol: string

  active: boolean

  note: string

  latestPriceDate?: string
}
