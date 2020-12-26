import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import Big from 'big.js'
import { Repository } from 'typeorm'

import { Account, AccountType } from './account.entity'
import { AccountKpis } from './account.kpis'
import { CurrenciesConversionService } from '../../currencies/currencies.conversion.service'

@Injectable()
export class AccountsKpisService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,

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
  private async getDepositBalance(account: Account): Promise<Big> {
    const { balance } = await this.accountsRepository
      .createQueryBuilder('account')
      .select('SUM(u.amount)', 'balance')
      .innerJoin('account.transactions', 't')
      .innerJoin('t.units', 'u')
      .where({ id: account.id })
      .getRawOne()
    return Big(balance)
  }
}
