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
  @ApiProperty()
  id: number

  @Column()
  @ApiProperty({ enum: AccountType, enumName: 'AccountType' })
  type: AccountType

  @Column()
  @ApiProperty()
  name: string

  @Column({ type: 'character', length: 36 })
  @ApiProperty()
  uuid: string

  @Column({ nullable: true, type: 'character', length: 3 })
  @ApiProperty()
  currencyCode: string

  @ManyToOne(() => Currency, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  currency: Currency

  @ManyToOne(() => Account, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @ApiHideProperty()
  referenceAccount: Account

  @Column({ nullable: true })
  @ApiProperty()
  referenceAccountId: number

  @Column()
  @ApiProperty()
  active: boolean

  @Column()
  @ApiProperty()
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

  @ApiPropertyOptional()
  kpis: AccountKpis
}
