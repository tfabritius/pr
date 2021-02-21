import { Field, ObjectType } from '@nestjs/graphql'
import { Prisma } from '@prisma/client'

@ObjectType()
export class ExchangeratePrice {
  date: string

  @Field(() => String)
  value: Prisma.Decimal
}
