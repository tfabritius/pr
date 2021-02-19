import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Portfolio {
  @Field(() => Int)
  id: number

  name: string

  note: string

  baseCurrencyCode: string

  createdAt: Date

  updatedAt: Date
}
