import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import Big from 'big.js'
import { Repository } from 'typeorm'

import { Account, AccountType } from './account.entity'
import { AccountKpis } from './account.kpis'

@Injectable()
export class AccountsKpisService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
  ) {}

  public async getKpis(account: Account): Promise<AccountKpis> {
    const kpis = new AccountKpis()

    if (account.type === AccountType.DEPOSIT) {
      const balance = await this.getDepositBalance(account)
      kpis.balance = balance
    }

    return kpis
  }

  /**
   * Gets balance of deposit account
   */
  private async getDepositBalance(account: Account): Promise<Big> {
    const b1 = await this.accountsRepository
      .createQueryBuilder('account')
      .select('SUM(u.amount)', 'balance')
      .innerJoin('account.transactions', 't')
      .innerJoin('t.units', 'u')
      .where({ id: account.id })
      .getRawOne()
    console.log(Big(b1.balance).toString())
    return Big(b1.balance)
  }
}
