import { Field, ObjectType, registerEnumType } from '@nestjs/graphql'
import { Prisma } from '@prisma/client'

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

registerEnumType(TransactionType, { name: 'TransactionType' })

@ObjectType()
export class PortfolioTransaction {
  /**
   * Primary key
   */
  id: number

  /**
   * ID of account
   */
  accountId: number

  /**
   * Type of transaction
   */
  type: string

  /**
   * Date at which transaction took place
   */
  datetime: Date

  /**
   * Corresponding transaction on different (securities/deposit) account
   * depending on transaction type
   */
  partnerTransaction?: PortfolioTransaction

  partnerTransactionId?: number

  /**
   * Units of transaction
   */
  units: TransactionUnit[]

  /**
   * Number of shares
   * (only if transaction belongs to securities account)
   */
  @Field(() => String)
  shares: Prisma.Decimal

  /**
   * ID of affected security
   * (only if transaction belongs to securities account)
   */
  securityId: number

  /**
   * User-defined comment to transaction
   */
  note: string
}
