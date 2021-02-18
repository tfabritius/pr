import { ObjectType, Field } from '@nestjs/graphql'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import Big from 'big.js'
import { Exclude, Transform } from 'class-transformer'

import { Security } from '../security.entity'

@ObjectType()
export class SecurityPrice {
  @ApiHideProperty()
  security: Security

  @Exclude()
  @ApiHideProperty()
  securityId: number

  date: string

  @Transform(({ value }: { value: Big }) => value.toFixed(8), {
    toPlainOnly: true,
  })
  @Field(() => String)
  @ApiProperty({ type: String, example: '1.00000000' })
  value: Big
}
