import { ApiHideProperty } from '@nestjs/swagger'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm'
import { Exclude } from 'class-transformer'

import { Portfolio } from '../portfolio.entity'
import { Transaction } from '../transactions/transaction.entity'
import { AccountKpis } from './account.kpis'
import { Currency } from '../../currencies/currency.entity'

export enum AccountType {
  DEPOSIT = 'deposit',
  SECURITIES = 'securities',
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  type: AccountType

  @Column()
  name: string

  @Column({ type: 'character', length: 36 })
  uuid: string

  @Column({ nullable: true, type: 'character', length: 3 })
  currencyCode: string

  @ManyToOne(() => Currency, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @ApiHideProperty()
  currency: Currency

  @ManyToOne(() => Account, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @ApiHideProperty()
  referenceAccount: Account

  @Column({ nullable: true })
  referenceAccountId: number

  @Column()
  active: boolean

  @Column()
  note: string

  @ManyToOne(() => Portfolio, (p) => p.accounts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @Index()
  @Exclude()
  @ApiHideProperty()
  portfolio: Portfolio

  @OneToMany(() => Transaction, (t) => t.account)
  @ApiHideProperty()
  @Exclude()
  transactions: Transaction[]

  kpis?: AccountKpis
}
