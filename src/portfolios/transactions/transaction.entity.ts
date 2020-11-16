import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger'
import { Exclude, Type } from 'class-transformer'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
  RelationId,
} from 'typeorm'

import { Account } from '../accounts/account.entity'
import { Portfolio } from '../portfolio.entity'
import { Security } from '../securities/security.entity'
import { TransactionUnit } from './unit.entity'

/**
 * Enum for transaction type
 */
export enum TransactionType {
  /**
   * Incoming/outgoing currency
   * - account type:        deposit
   * - partner transaction: not allowed
   */
  PAYMENT = 'Payment',

  /**
   * Transfer of currency between accounts
   * - account type:        deposit
   * - partner transaction: required
   */
  CURRENCY_TRANSFER = 'CurrencyTransfer',

  /**
   * Interest (positive/negative)
   * - account type:        deposit
   * - partner transaction: not allowed
   */
  DEPOSIT_INTEREST = 'DepositInterest',

  /**
   * Fee (positive/negative) for deposit account
   * - account type:        deposit
   * - partner transaction: not allowed
   */
  DEPOSIT_FEE = 'DepositFee',

  /**
   * Tax (positive/negative) for deposit account
   * - account type:        deposit
   * - partner transaction: not allowed
   */
  DEPOSIT_TAX = 'DepositTax',

  /**
   * Buying/selling or delivery (incoming/outgoing) of shares
   * - account type:        securities and deposit (for buying/selling)
   * - partner transaction: possible (for buying/selling)
   */
  SECURITIES_ORDER = 'SecuritiesOrder',

  /**
   * Dividend for security
   * - account type:        securities and deposit
   * - partner transaction: required
   */
  SECURITIES_DIVIDEND = 'SecuritiesDividend',

  /**
   * Fee (positive/negative) for security or securites account
   * - account type:        securities and deposit
   * - partner transaction: required
   */
  SECURITIES_FEE = 'SecuritiesFee',

  /**
   * Tax (positive/negative) for security or securites account
   * - account type:        securities and deposit
   * - partner transaction: required
   */
  SECURITIES_TAX = 'SecuritiesTax',

  /**
   * Transfer of shares between accounts
   * - account type:        securities
   * - partner transaction: required
   */
  SECURITIES_TRANSFER = 'SecuritiesTransfer',
}

@Entity('transactions')
export class Transaction {
  /**
   * Primary key
   */
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number

  /**
   * Portfolio this transaction belongs to
   */
  @ManyToOne(() => Portfolio, (p) => p.transactions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @Exclude()
  @Index()
  @ApiHideProperty()
  portfolio: Portfolio

  /**
   * Account this transaction belongs to
   */
  @ManyToOne(() => Account, (a) => a.transactions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @Index()
  @ApiHideProperty()
  account: Account

  /**
   * ID of account
   */
  @Column({ nullable: false })
  @RelationId((transaction: Transaction) => transaction.account)
  @ApiProperty()
  accountId: number

  /**
   * Type of transaction
   */
  @Column()
  @ApiProperty({ enum: TransactionType, enumName: 'TransactionType' })
  type: TransactionType

  /**
   * Date at which transaction took place
   */
  @Column({
    type: 'timestamp with time zone',
  })
  @ApiProperty()
  datetime: Date

  /**
   * Corresponding transaction on different (securities/deposit) account
   * depending on transaction type
   */
  @OneToOne(() => Transaction, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  @ApiPropertyOptional()
  @Type(() => Transaction)
  partnerTransaction: Transaction

  @Column({ nullable: true })
  @RelationId((transaction: Transaction) => transaction.partnerTransaction)
  @ApiProperty()
  partnerTransactionId: number

  /**
   * Units of transaction
   */
  @OneToMany(() => TransactionUnit, (u) => u.transaction, {
    cascade: true,
    eager: true,
  })
  units: TransactionUnit[]

  /**
   * Number of shares
   * (only if transaction belongs to securities account)
   */
  @Column('decimal', { precision: 12, scale: 6, nullable: true })
  @ApiProperty({ example: '0.000000' })
  shares: string

  /**
   * Affected security
   * (only if transaction belongs to securities account)
   */
  @ManyToOne(() => Security, (security) => security.transactions, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @Index()
  @ApiHideProperty()
  security: Security

  /**
   * ID of affected security
   */
  @Column({ nullable: true })
  @RelationId((transaction: Transaction) => transaction.security)
  @ApiProperty()
  securityId: number

  /**
   * User-defined comment to transaction
   */
  @Column()
  @ApiProperty()
  note: string
}
