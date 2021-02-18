import { Injectable } from '@nestjs/common'
import { Account, Prisma } from '@prisma/client'

import { AccountType } from './account.entity'
import { AccountKpis } from './account.kpis'
import { CurrenciesConversionService } from '../../currencies/currencies.conversion.service'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class AccountsKpisService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly currenciesConversionService: CurrenciesConversionService,
  ) {}

  public async getKpis(
    account: Account,
    { baseCurrencyCode }: { baseCurrencyCode: string },
  ): Promise<AccountKpis> {
    const kpis = new AccountKpis()

    if (account.type === AccountType.DEPOSIT) {
      const balance = await this.getDepositBalance(account)
      kpis.balance = balance

      if (baseCurrencyCode) {
        kpis.valueInBaseCurrency = await this.currenciesConversionService.convertCurrencyAmount(
          kpis.balance,
          account.currencyCode,
          baseCurrencyCode,
        )
      }
    }

    return kpis
  }

  /**
   * Gets balance of deposit account
   */
  private async getDepositBalance(account: Account): Promise<Prisma.Decimal> {
    const { sum } = await this.prisma.transactionUnit.aggregate({
      sum: { amount: true },
      where: { transaction: { accountId: account.id } },
    })
    return sum.amount
  }
}
