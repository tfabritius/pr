import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm'
import { Exclude } from 'class-transformer'
import * as dayjs from 'dayjs'

import { Portfolio } from '../portfolio.entity'
import { SecurityPrice } from './prices/price.entity'
import { Transaction } from '../transactions/transaction.entity'
import { SecurityKpis } from './security.kpis'
import { Currency } from '../../currencies/currency.entity'

@Entity('portfolios_securities')
export class Security {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number

  @Column()
  @ApiProperty()
  name: string

  @Column({ type: 'character', length: 36 })
  @ApiProperty()
  uuid: string

  @Column({ nullable: false, type: 'character', length: 3 })
  @ApiProperty()
  currencyCode: string

  @ManyToOne(() => Currency, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  currency: Currency

  @Column()
  @ApiProperty()
  isin: string

  @Column()
  @ApiProperty()
  wkn: string

  @Column()
  @ApiProperty()
  symbol: string

  @Column()
  @ApiProperty()
  active: boolean

  @Column()
  @ApiProperty()
  note: string

  @ManyToOne(() => Portfolio, (p) => p.securities, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @Index()
  @Exclude()
  @ApiHideProperty()
  portfolio: Portfolio

  @OneToMany(() => Transaction, (t) => t.security)
  @ApiHideProperty()
  transactions: Transaction[]

  @OneToMany(() => SecurityPrice, (sp) => sp.security)
  @ApiProperty({ type: SecurityPrice, isArray: true })
  prices: SecurityPrice[]

  @ApiProperty({ example: dayjs().format('YYYY-MM-DD') })
  latestPriceDate: string

  @ApiPropertyOptional()
  kpis: SecurityKpis
}
