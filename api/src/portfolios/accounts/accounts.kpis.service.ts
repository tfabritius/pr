import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { Account, AccountType } from './account.entity'
import { CurrenciesConversionService } from '../../currencies/currencies.conversion.service'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class AccountsKpisService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly currenciesConversionService: CurrenciesConversionService,
  ) {}

  /**
   * Gets current value of account
   */
  public async getValue(
    account: Account,
    { currencyCode }: { currencyCode: string },
  ): Promise<Prisma.Decimal> {
    let value: Prisma.Decimal

    if (account.type === AccountType.DEPOSIT) {
      value = await this.getDepositBalance(account)
    } else {
      // Handling of SecuritiesAccount is not implemented yet
      value = new Prisma.Decimal(0)
    }

    if (currencyCode) {
      return await this.currenciesConversionService.convertCurrencyAmount(
        value,
        account.currencyCode,
        currencyCode,
      )
    }
  }

  /**
   * Gets balance of deposit account
   */
  public async getDepositBalance(account: Account): Promise<Prisma.Decimal> {
    const { _sum } = await this.prisma.transactionUnit.aggregate({
      _sum: { amount: true },
      where: {
        transaction: {
          portfolioId: account.portfolioId,
          accountUuid: account.uuid,
        },
      },
    })
    return _sum.amount
  }
}
