import { ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Event {
  date: Date
  type: string
  amount?: string
  currencyCode?: string
  ratio?: string
}
