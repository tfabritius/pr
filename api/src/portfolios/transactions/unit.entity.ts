import { ApiProperty } from '@nestjs/swagger'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
} from 'typeorm'
import Big from 'big.js'
import { Transform } from 'class-transformer'

import { Transaction } from './transaction.entity'
import { DecimalTransformer } from '../../utils/DecimalTransformer'
import { Currency } from '../../currencies/currency.entity'

/**
 * Enum for unit type
 */
export enum UnitType {
  BASE = 'base',
  TAX = 'tax',
  FEE = 'fee',
}

@Entity('transactions_units')
export class TransactionUnit {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Transaction, (transaction) => transaction.units, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @Index()
  transaction: Transaction

  @Column()
  @ApiProperty({ enum: UnitType })
  type: UnitType

  /**
   * Amount of currency
   */
  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  @Transform((value: Big) => value.toFixed(2), { toPlainOnly: true })
  @ApiProperty({ type: String, example: '0.00' })
  amount: Big

  /**
   * Currency code for amount
   */
  @Column({ nullable: false, type: 'character', length: 3 })
  @ApiProperty()
  currencyCode: string

  @ManyToOne(() => Currency, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  currency: Currency

  /**
   * Amount in original (foreign) currency
   * in case of currency conversion
   */
  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: new DecimalTransformer(),
  })
  @Transform((value: Big | null) => (value ? value.toFixed(2) : null), {
    toPlainOnly: true,
  })
  @ApiProperty({ type: String, example: '0.00', nullable: true })
  originalAmount: Big | null

  /**
   * Currency code of original (foreign) currency
   * in case of currency conversion
   */
  @Column({ nullable: true, type: 'character', length: 3 })
  @ApiProperty()
  originalCurrencyCode: string

  @ManyToOne(() => Currency, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  originalCurrency: Currency

  /**
   * Exchange rate for currency conversion
   */
  @Column('decimal', {
    precision: 16,
    scale: 8,
    nullable: true,
    transformer: new DecimalTransformer(),
  })
  @Transform((value: Big | null) => (value ? value.toFixed(8) : null), {
    toPlainOnly: true,
  })
  @ApiProperty({ type: String, example: '0.00000000', nullable: true })
  exchangeRate: Big | null
}
