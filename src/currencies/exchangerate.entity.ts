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

import { Currency } from './currency.entity'
import { ExchangeRatePrice } from './price.entity'

@Entity('exchangerates')
@Index(['baseCurrencyCode', 'quoteCurrencyCode'], { unique: true })
export class ExchangeRate {
  @PrimaryGeneratedColumn()
  @ApiProperty()
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

  @OneToMany(() => ExchangeRatePrice, (erp) => erp.exchangerate)
  prices: ExchangeRatePrice[]
}
