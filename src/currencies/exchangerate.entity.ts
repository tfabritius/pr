import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Index,
  RelationId,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'
import * as dayjs from 'dayjs'

import { Currency } from './currency.entity'
import { ExchangeRatePrice } from './price.entity'

@Entity('exchangerates')
@Index(['baseCurrencyCode', 'quoteCurrencyCode'], { unique: true })
export class ExchangeRate {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number

  @ManyToOne(() => Currency, { nullable: false })
  baseCurrency: Currency

  @Column({ nullable: false })
  @RelationId((er: ExchangeRate) => er.baseCurrency)
  @ApiProperty()
  baseCurrencyCode: string

  @ManyToOne(() => Currency, { nullable: false })
  quoteCurrency: Currency

  @Column({ nullable: false })
  @RelationId((er: ExchangeRate) => er.quoteCurrency)
  @ApiProperty()
  quoteCurrencyCode: string

  @OneToMany(() => ExchangeRatePrice, (erp) => erp.exchangerate, {
    cascade: ['insert'],
  })
  @ApiProperty({ type: ExchangeRatePrice, isArray: true })
  prices: ExchangeRatePrice[]

  @ApiProperty({ example: dayjs().format('YYYY-MM-DD') })
  latestPriceDate: string
}
