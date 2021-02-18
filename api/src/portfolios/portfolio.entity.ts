import { Field, Int, ObjectType } from '@nestjs/graphql'
import { ApiHideProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

import { User } from '../auth/users/user.entity'
import { Security } from './securities/security.entity'
import { Account } from './accounts/account.entity'
import { Transaction } from './transactions/transaction.entity'
import { Currency } from '../currencies/currency.entity'

@ObjectType()
export class Portfolio {
  @Field(() => Int)
  id: number

  name: string

  note: string

  baseCurrencyCode: string

  @ApiHideProperty()
  baseCurrency: Currency

  createdAt: Date

  updatedAt: Date

  @Exclude()
  @ApiHideProperty()
  user: User

  @Exclude()
  @Field(() => [Security])
  @ApiHideProperty()
  securities: Security[]

  @Exclude()
  @ApiHideProperty()
  accounts: Account[]

  @Exclude()
  @ApiHideProperty()
  transactions: Transaction[]
}
