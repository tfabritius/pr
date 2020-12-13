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
  @ApiProperty()
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
  @Column()
  @ApiProperty()
  currencyCode: string

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
  @Column({ nullable: true })
  @ApiProperty()
  originalCurrencyCode: string

  /**
   * Exchange rate for currency conversion
   */
  @Column('decimal', {
    precision: 10,
    scale: 4,
    nullable: true,
    transformer: new DecimalTransformer(),
  })
  @Transform((value: Big | null) => (value ? value.toFixed(4) : null), {
    toPlainOnly: true,
  })
  @ApiProperty({ type: String, example: '0.0000', nullable: true })
  exchangeRate: Big | null
}
