import { ObjectType, registerEnumType } from '@nestjs/graphql'

export enum AccountType {
  DEPOSIT = 'deposit',
  SECURITIES = 'securities',
}

registerEnumType(AccountType, { name: 'AccountType' })

@ObjectType()
export class Account {
  id: number

  type: string

  name: string

  uuid: string

  currencyCode: string

  referenceAccountId: number

  active: boolean

  note: string
}
