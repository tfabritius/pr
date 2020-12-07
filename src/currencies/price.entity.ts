import { Entity, Column, ManyToOne, RelationId, PrimaryColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

import { ExchangeRate } from './exchangerate.entity'

@Entity('exchangerates_prices')
export class ExchangeRatePrice {
  @ManyToOne(() => ExchangeRate, (er: ExchangeRate) => er.prices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  exchangerate: ExchangeRate

  @PrimaryColumn({ nullable: false })
  @RelationId((erp: ExchangeRatePrice) => erp.exchangerate)
  @Exclude()
  exchangerateId: string

  @PrimaryColumn('date', {
    nullable: false,
  })
  @ApiProperty()
  date: string

  @Column('decimal', { nullable: false, precision: 12, scale: 6 })
  @ApiProperty()
  value: string
}
