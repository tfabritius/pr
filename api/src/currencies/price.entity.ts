import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import Big from 'big.js'
import { Exclude, Transform } from 'class-transformer'
import * as dayjs from 'dayjs'

import { ExchangeRate } from './exchangerate.entity'
import { DecimalTransformer } from '../utils/DecimalTransformer'

@Entity('exchangerates_prices')
export class ExchangeRatePrice {
  @ManyToOne(() => ExchangeRate, (er: ExchangeRate) => er.prices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  exchangerate: ExchangeRate

  @PrimaryColumn({ nullable: false })
  @Exclude()
  exchangerateId: number

  @PrimaryColumn('date', {
    nullable: false,
  })
  @ApiProperty({ example: dayjs().format('YYYY-MM-DD') })
  date: string

  @Column('decimal', {
    nullable: false,
    precision: 16,
    scale: 8,
    transformer: new DecimalTransformer(),
  })
  @Transform((value: Big) => value.toFixed(8), { toPlainOnly: true })
  @ApiProperty({ type: String, example: '1.00000000' })
  value: Big
}
