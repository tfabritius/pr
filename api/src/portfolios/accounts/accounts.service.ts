import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Account } from '@prisma/client'

import { Portfolio } from '../portfolio.entity'
import { AccountDto } from './accounts.dto'
import { AccountType } from './account.entity'
import { AccountParams } from './account.params'
import { PortfolioParams } from '../portfolio.params'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sanitizes DTO, i.e. copies relevant attributes and verifies validity of reference account id
   */
  private async sanitizeDto(
    portfolioId: number,
    dto: AccountDto,
  ): Promise<AccountDto> {
    const ret = {
      active: dto.active,
      name: dto.name,
      note: dto.note,
      type: dto.type,
      uuid: dto.uuid,
      currencyCode: null,
      referenceAccountId: null,
    }

    if (dto.type === AccountType.DEPOSIT) {
      ret.currencyCode = dto.currencyCode
    } else {
      const referenceAccount = await this.prisma.account.findFirst({
        where: {
          id: dto.referenceAccountId,
          portfolioId,
        },
      })

      if (!referenceAccount) {
        throw new BadRequestException('referenceAccount not found')
      }

      ret.referenceAccountId = dto.referenceAccountId
    }

    return ret
  }

  /**
   * Creates account in portfolio
   */
  async create(portfolio: Portfolio, dto: AccountDto): Promise<Account> {
    const sanitizedDto = await this.sanitizeDto(portfolio.id, dto)
    return await this.prisma.account.create({
      data: { ...sanitizedDto, portfolioId: portfolio.id },
    })
  }

  /**
   * Gets all accounts in a portfolio
   */
  async getAll(
    { portfolioId }: PortfolioParams,
    {
      includeTransactions = false,
    }: {
      includeTransactions?: boolean
    } = {},
  ): Promise<Account[]> {
    return this.prisma.account.findMany({
      where: { portfolioId },
      include: { transactions: includeTransactions },
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

    const account = await this.prisma.account.findFirst({
      where: { id: params.accountId, portfolioId: params.portfolioId },
      include: { transactions: includeTransactions },
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
    await this.getOne(params)
    const sanitizedDto = await this.sanitizeDto(params.portfolioId, dto)
    return await this.prisma.account.update({
      data: sanitizedDto,
      where: { id: params.accountId },
    })
  }

  /**
   * Deletes account identified by parameters
   */
  async delete(params: AccountParams): Promise<void> {
    const affected = await this.prisma
      .$executeRaw`DELETE FROM portfolios_accounts WHERE id=${params.accountId} AND portfolio_id=${params.portfolioId}`

    if (affected == 0) {
      throw new NotFoundException('Account not found')
    }
  }
}
