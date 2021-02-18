import { ObjectType, registerEnumType, HideField } from '@nestjs/graphql'
import { ApiHideProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

import { Portfolio } from '../portfolio.entity'
import { Transaction } from '../transactions/transaction.entity'
import { AccountKpis } from './account.kpis'
import { Currency } from '../../currencies/currency.entity'

export enum AccountType {
  DEPOSIT = 'deposit',
  SECURITIES = 'securities',
}

registerEnumType(AccountType, { name: 'AccountType' })

@ObjectType()
export class Account {
  id: number

  type: AccountType

  name: string

  uuid: string

  currencyCode: string

  @ApiHideProperty()
  currency: Currency

  @ApiHideProperty()
  referenceAccount: Account

  referenceAccountId: number

  active: boolean

  note: string

  @Exclude()
  @ApiHideProperty()
  portfolio: Portfolio

  @ApiHideProperty()
  @Exclude()
  transactions: Transaction[]

  @HideField()
  kpis?: AccountKpis
}
