import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Portfolio } from '../portfolio.entity'
import { AccountDto } from './accounts.dto'
import { Account, AccountType } from './account.entity'
import { AccountParams } from './account.params'
import { PortfolioParams } from '../portfolio.params'

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
  ) {}

  /**
   * Copies relevant attributes from dto to account object
   */
  private async copyDtoToAccount(
    portfolioId: number,
    dto: AccountDto,
    account: Account,
  ) {
    account.name = dto.name
    account.note = dto.note
    account.type = dto.type
    account.uuid = dto.uuid

    if (dto.type === AccountType.DEPOSIT) {
      account.currencyCode = dto.currencyCode
      account.referenceAccount = null
    } else {
      account.currencyCode = null
      account.referenceAccount = await this.accountsRepository.findOne({
        where: {
          id: dto.referenceAccountId,
          portfolio: { id: portfolioId },
        },
      })

      if (!account.referenceAccount) {
        throw new BadRequestException('referenceAccount not found')
      }
    }
  }

  /**
   * Creates account in portfolio
   */
  async create(portfolio: Portfolio, dto: AccountDto): Promise<Account> {
    const account = new Account()
    await this.copyDtoToAccount(portfolio.id, dto, account)
    account.portfolio = portfolio
    return await this.accountsRepository.save(account)
  }

  /**
   * Gets all accounts in a portfolio
   */
  async getAll(
    params: PortfolioParams,
    {
      includeTransactions = false,
    }: {
      includeTransactions?: boolean
    } = {},
  ): Promise<Account[]> {
    const relations = []
    if (includeTransactions) {
      relations.push('transactions')
    }

    return this.accountsRepository.find({
      where: {
        portfolio: { id: params.portfolioId },
      },
      relations,
    })
  }

  /**
   * Gets account identified by parameters
   * or throws NotFoundException
   */
  async getOne(
    params: AccountParams,
    {
      includeTransactions = false,
    }: {
      includeTransactions?: boolean
    } = {},
  ): Promise<Account> {
    const relations = []
    if (includeTransactions) {
      relations.push('transactions')
    }

    const account = await this.accountsRepository.findOne({
      where: {
        id: params.accountId,
        portfolio: { id: params.portfolioId },
      },
      relations,
    })

    if (!account) {
      throw new NotFoundException('Account not found')
    }

    return account
  }

  /**
   * Updates account identified by the parameters
   * or throws NotFoundException
   */
  async update(params: AccountParams, dto: AccountDto): Promise<Account> {
    const account = await this.getOne(params)
    await this.copyDtoToAccount(params.portfolioId, dto, account)
    return await this.accountsRepository.save(account)
  }

  /**
   * Deletes account identified by parameters
   */
  async delete(params: AccountParams): Promise<void> {
    const { affected } = await this.accountsRepository.delete({
      id: params.accountId,
      portfolio: { id: params.portfolioId },
    })

    if (affected == 0) {
      throw new NotFoundException('Account not found')
    }
  }
}
