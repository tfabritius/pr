import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class PortfolioSecurity {
  @Field(() => Int)
  portfolioId: number

  name: string

  uuid: string

  currencyCode: string

  isin: string

  wkn: string

  symbol: string

  active: boolean

  note: string

  latestPriceDate?: string

  /**
   * UUID of (central) security
   */
  securityUuid?: string

  /**
   * Date and time at which security was updated last by a user
   */
  updatedAt: Date
}
