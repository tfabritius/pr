import { ObjectType, registerEnumType, Field } from '@nestjs/graphql'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import Big from 'big.js'
import { Transform } from 'class-transformer'

import { Transaction } from './transaction.entity'
import { Currency } from '../../currencies/currency.entity'

/**
 * Enum for unit type
 */
export enum UnitType {
  BASE = 'base',
  TAX = 'tax',
  FEE = 'fee',
}

registerEnumType(UnitType, { name: 'TransactionUnitType' })

@ObjectType()
export class TransactionUnit {
  @ApiHideProperty()
  id: number

  @ApiHideProperty()
  transaction: Transaction

  type: UnitType

  /**
   * Amount of currency
   */
  @Transform(({ value }: { value: Big }) => value.toFixed(2), {
    toPlainOnly: true,
  })
  @Field(() => String)
  @ApiProperty({ type: String, example: '0.00' })
  amount: Big

  /**
   * Currency code for amount
   */
  currencyCode: string

  @ApiHideProperty()
  currency: Currency

  /**
   * Amount in original (foreign) currency
   * in case of currency conversion
   */
  @Transform(
    ({ value }: { value: Big | null }) => (value ? value.toFixed(2) : null),
    {
      toPlainOnly: true,
    },
  )
  @Field(() => String)
  @ApiProperty({ type: String, example: '0.00', nullable: true })
  originalAmount: Big | null

  /**
   * Currency code of original (foreign) currency
   * in case of currency conversion
   */
  originalCurrencyCode?: string

  @ApiHideProperty()
  originalCurrency: Currency

  /**
   * Exchange rate for currency conversion
   */
  @Transform(
    ({ value }: { value: Big | null }) => (value ? value.toFixed(8) : null),
    {
      toPlainOnly: true,
    },
  )
  @Field(() => String)
  @ApiProperty({ type: String, example: '0.00000000', nullable: true })
  exchangeRate: Big | null
}
