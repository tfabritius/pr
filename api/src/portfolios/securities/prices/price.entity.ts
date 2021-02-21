import { ObjectType, Field } from '@nestjs/graphql'
import { ApiProperty } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'

@ObjectType()
export class PortfolioSecurityPrice {
  date: string

  @Field(() => String)
  @ApiProperty({ type: String, example: '1.00000000' })
  value: Prisma.Decimal
}
