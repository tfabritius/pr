import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Account } from '@prisma/client'

import { CreateUpdateAccountDto } from '../dto/CreateUpdateAccount.dto'
import { AccountType } from './account.entity'
import { AccountParams } from './account.params'
import { PortfolioParams } from '../portfolio.params'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates or updates account
   */
  async upsert(
    { portfolioId, accountUuid: uuid }: AccountParams,
    {
      type,
      name,
      currencyCode,
      referenceAccountUuid,
      active,
      note,
      updatedAt,
    }: CreateUpdateAccountDto,
  ): Promise<Account> {
    if (type === AccountType.DEPOSIT) {
      return await this.prisma.account.upsert({
        create: {
          uuid,
          type,
          name,
          active,
          note,
          updatedAt,
          currency: { connect: { code: currencyCode } },
          portfolio: { connect: { id: portfolioId } },
          referenceAccountUuid: null,
        },
        update: {
          name,
          active,
          note,
          updatedAt,
          currency: { connect: { code: currencyCode } },
        },
        where: { portfolioId_uuid: { portfolioId, uuid } },
      })
    } else if (type === AccountType.SECURITIES) {
      try {
        await this.getOne({ portfolioId, accountUuid: referenceAccountUuid })
      } catch (e) {
        throw new BadRequestException('referenceAccountUuid not found')
      }
      return await this.prisma.account.upsert({
        create: {
          uuid,
          type,
          name,
          active,
          note,
          updatedAt,
          referenceAccountUuid,
          portfolio: { connect: { id: portfolioId } },
        },
        update: {
          name,
          active,
          note,
          updatedAt,
          referenceAccountUuid,
        },
        where: { portfolioId_uuid: { portfolioId, uuid } },
      })
    }
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

    const account = await this.prisma.account.findUnique({
      where: {
        portfolioId_uuid: {
          uuid: params.accountUuid,
          portfolioId: params.portfolioId,
        },
      },
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
  async update(
    params: AccountParams,
    dto: CreateUpdateAccountDto,
  ): Promise<Account> {
    return await this.prisma.account.update({
      data: dto,
      where: {
        portfolioId_uuid: {
          portfolioId: params.portfolioId,
          uuid: params.accountUuid,
        },
      },
    })
  }

  /**
   * Deletes account identified by parameters
   */
  async delete(params: AccountParams) {
    const account = await this.getOne(params)

    await this.prisma
      .$executeRaw`DELETE FROM portfolios_accounts WHERE uuid=${params.accountUuid} AND portfolio_id=${params.portfolioId}`

    return account
  }
}
