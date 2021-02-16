import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm'
import { ObjectType, Field } from '@nestjs/graphql'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import Big from 'big.js'
import { Exclude, Transform } from 'class-transformer'

import { ExchangeRate } from './exchangerate.entity'
import { DecimalTransformer } from '../utils/DecimalTransformer'

@Entity('exchangerates_prices')
@ObjectType()
export class ExchangeRatePrice {
  @ManyToOne(() => ExchangeRate, (er: ExchangeRate) => er.prices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  exchangerate: ExchangeRate

  @PrimaryColumn({ nullable: false })
  @ApiHideProperty()
  @Exclude()
  exchangerateId: number

  @PrimaryColumn('date', {
    nullable: false,
  })
  date: string

  @Column('decimal', {
    nullable: false,
    precision: 16,
    scale: 8,
    transformer: new DecimalTransformer(),
  })
  @Transform(({ value }: { value: Big }) => value.toFixed(8), {
    toPlainOnly: true,
  })
  @Field(() => String)
  @ApiProperty({ type: String, example: '1.00000000' })
  value: Big
}
