import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm'
import { Exclude } from 'class-transformer'

import { Portfolio } from '../portfolio.entity'
import { Transaction } from '../transactions/transaction.entity'

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

  @Column()
  @ApiProperty()
  uuid: string

  @Column({ nullable: true })
  @ApiProperty()
  currencyCode: string

  @ManyToOne(() => Account, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @ApiProperty()
  referenceAccount: Account

  @Column()
  @ApiProperty()
  note: string

  @ManyToOne(() => Portfolio, (p) => p.accounts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @Exclude()
  @ApiHideProperty()
  portfolio: Portfolio

  @OneToMany(() => Transaction, (t) => t.account)
  @ApiHideProperty()
  transactions: Transaction[]
}
