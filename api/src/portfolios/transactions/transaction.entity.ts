import { ObjectType, registerEnumType } from '@nestjs/graphql'
import { ApiHideProperty } from '@nestjs/swagger'
import { Exclude, Type } from 'class-transformer'

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

registerEnumType(TransactionType, { name: 'TransactionType' })

@ObjectType()
export class Transaction {
  /**
   * Primary key
   */
  id: number

  /**
   * Portfolio this transaction belongs to
   */
  @Exclude()
  @ApiHideProperty()
  portfolio: Portfolio

  /**
   * Account this transaction belongs to
   */
  @ApiHideProperty()
  account: Account

  /**
   * ID of account
   */
  accountId: number

  /**
   * Type of transaction
   */
  type: TransactionType

  /**
   * Date at which transaction took place
   */
  datetime: Date

  /**
   * Corresponding transaction on different (securities/deposit) account
   * depending on transaction type
   */
  @Type(() => Transaction)
  partnerTransaction?: Transaction

  partnerTransactionId?: number

  /**
   * Units of transaction
   */
  units: TransactionUnit[]

  /**
   * Number of shares
   * (only if transaction belongs to securities account)
   */
  shares: string

  /**
   * Affected security
   * (only if transaction belongs to securities account)
   */
  @ApiHideProperty()
  security: Security

  /**
   * ID of affected security
   */
  securityId: number

  /**
   * User-defined comment to transaction
   */
  note: string
}
