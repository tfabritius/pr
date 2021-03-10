import { ObjectType, registerEnumType } from '@nestjs/graphql'

export enum AccountType {
  DEPOSIT = 'deposit',
  SECURITIES = 'securities',
}

registerEnumType(AccountType, { name: 'AccountType' })

@ObjectType()
export class Account {
  portfolioId: number

  type: string

  name: string

  uuid: string

  currencyCode: string

  referenceAccountUuid: string

  active: boolean

  note: string

  /**
   * Date and time at which account was updated last by a user
   */
  updatedAt: Date
}
