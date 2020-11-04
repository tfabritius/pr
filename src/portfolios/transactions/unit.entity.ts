import { ApiProperty } from '@nestjs/swagger'
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { Transaction } from './transaction.entity'

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
  @ApiProperty()
  transaction: Transaction

  @Column()
  @ApiProperty({ enum: UnitType })
  type: UnitType

  /**
   * Amount of currency
   */
  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty({ example: '0.00' })
  amount: string

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
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  @ApiProperty({ example: '0.00' })
  originalAmount: string

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
  @Column('decimal', { precision: 10, scale: 4, nullable: true })
  @ApiProperty({ example: '0.0000' })
  exchangeRate: string
}
