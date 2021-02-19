import { ObjectType, registerEnumType, Field } from '@nestjs/graphql'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'

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

  type: string

  /**
   * Amount of currency
   */
  @Field(() => String)
  @ApiProperty({ type: String, example: '0.00' })
  amount: Prisma.Decimal

  /**
   * Currency code for amount
   */
  currencyCode: string

  /**
   * Amount in original (foreign) currency
   * in case of currency conversion
   */
  @Field(() => String)
  @ApiProperty({ type: String, example: '0.00', nullable: true })
  originalAmount?: Prisma.Decimal

  /**
   * Currency code of original (foreign) currency
   * in case of currency conversion
   */
  originalCurrencyCode?: string

  /**
   * Exchange rate for currency conversion
   */
  @Field(() => String)
  @ApiProperty({ type: String, example: '0.00000000', nullable: true })
  exchangerate?: Prisma.Decimal
}
