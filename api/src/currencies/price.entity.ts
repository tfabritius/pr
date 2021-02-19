import { Field, ObjectType } from '@nestjs/graphql'
import { Prisma } from '@prisma/client'

@ObjectType()
export class ExchangeratePrice {
  date: Date

  @Field(() => String)
  value: Prisma.Decimal
}
