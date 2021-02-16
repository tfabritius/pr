import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm'
import { ObjectType } from '@nestjs/graphql'
import { ApiHideProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

import { Currency } from './currency.entity'
import { ExchangeRatePrice } from './price.entity'

@Entity('exchangerates')
@ObjectType()
export class ExchangeRate {
  @PrimaryGeneratedColumn()
  @ApiHideProperty()
  @Exclude()
  id: number

  @ManyToOne(() => Currency, { nullable: false })
  @ApiHideProperty()
  baseCurrency: Currency

  @Column({ nullable: false, type: 'character', length: 3 })
  baseCurrencyCode: string

  @ManyToOne(() => Currency, { nullable: false })
  @ApiHideProperty()
  quoteCurrency: Currency

  @Column({ nullable: false, type: 'character', length: 3 })
  quoteCurrencyCode: string

  @OneToMany(() => ExchangeRatePrice, (erp) => erp.exchangerate, {
    cascade: ['insert'],
  })
  prices: ExchangeRatePrice[]

  latestPriceDate: string
}
