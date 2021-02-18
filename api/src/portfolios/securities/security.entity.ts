import { ApiHideProperty } from '@nestjs/swagger'
import { Field, Int, ObjectType, HideField } from '@nestjs/graphql'
import { Exclude } from 'class-transformer'

import { Portfolio } from '../portfolio.entity'
import { SecurityPrice } from './prices/price.entity'
import { Transaction } from '../transactions/transaction.entity'
import { SecurityKpis } from './security.kpis'
import { Currency } from '../../currencies/currency.entity'

@ObjectType()
export class Security {
  @Field(() => Int)
  id: number

  name: string

  uuid: string

  currencyCode: string

  @ApiHideProperty()
  currency: Currency

  isin: string

  wkn: string

  symbol: string

  active: boolean

  note: string

  @Exclude()
  @ApiHideProperty()
  portfolio: Portfolio

  @ApiHideProperty()
  transactions: Transaction[]

  prices: SecurityPrice[]

  latestPriceDate: string

  @HideField()
  kpis?: SecurityKpis
}
