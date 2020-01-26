import { ApiHideProperty } from '@nestjs/swagger'
import { Field, Int, ObjectType } from '@nestjs/graphql'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm'
import { Exclude } from 'class-transformer'

import { Portfolio } from '../portfolio.entity'
import { SecurityPrice } from './prices/price.entity'
import { Transaction } from '../transactions/transaction.entity'
import { SecurityKpis } from './security.kpis'
import { Currency } from '../../currencies/currency.entity'

@Entity('portfolios_securities')
@ObjectType()
export class Security {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number

  @Column()
  @Field()
  name: string

  @Column({ type: 'character', length: 36 })
  @Field()
  uuid: string

  @Column({ nullable: false, type: 'character', length: 3 })
  @Field()
  currencyCode: string

  @ManyToOne(() => Currency, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @ApiHideProperty()
  currency: Currency

  @Column()
  @Field()
  isin: string

  @Column()
  @Field()
  wkn: string

  @Column()
  @Field()
  symbol: string

  @Column()
  @Field()
  active: boolean

  @Column()
  note: string

  @ManyToOne(() => Portfolio, (p) => p.securities, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @Exclude()
  @ApiHideProperty()
  portfolio: Portfolio

  @OneToMany(() => Transaction, (t) => t.security)
  @ApiHideProperty()
  transactions: Transaction[]

  @OneToMany(() => SecurityPrice, (sp) => sp.security)
  prices: SecurityPrice[]

  latestPriceDate: string

  kpis?: SecurityKpis
}
