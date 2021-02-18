import { ObjectType, Field } from '@nestjs/graphql'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import Big from 'big.js'
import { Exclude, Transform } from 'class-transformer'

import { ExchangeRate } from './exchangerate.entity'

@ObjectType()
export class ExchangeRatePrice {
  exchangerate: ExchangeRate

  @ApiHideProperty()
  @Exclude()
  exchangerateId: number

  date: string

  @Transform(({ value }: { value: Big }) => value.toFixed(8), {
    toPlainOnly: true,
  })
  @Field(() => String)
  @ApiProperty({ type: String, example: '1.00000000' })
  value: Big
}
