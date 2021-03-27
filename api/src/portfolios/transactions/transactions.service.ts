import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma, Transaction, TransactionUnit } from '@prisma/client'

import { PortfolioParams } from '../portfolio.params'
import { TransactionParams } from './transaction.params'
import {
  CreateUpdateTransactionDto,
  TransactionUnitDto,
} from '../dto/CreateUpdateTransaction.dto'
import { PrismaService } from '../../prisma.service'
import { matchArrays } from '../../utils/match-arrays'
import { AccountParams } from '../accounts/account.params'
import { PortfolioSecurityParams } from '../securities/security.params'

const defaultUnitsQuery: Prisma.TransactionUnitFindManyArgs = {
  select: {
    type: true,
    amount: true,
    currencyCode: true,
    originalAmount: true,
    originalCurrencyCode: true,
    exchangeRate: true,
  },
}

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates or updates transaction
   */
  async upsert(
    { portfolioId, transactionUuid: uuid }: TransactionParams,
    dto: CreateUpdateTransactionDto,
  ): Promise<Transaction & { units: TransactionUnit[] }> {
    const account = await this.prisma.account.findUnique({
      where: { portfolioId_uuid: { portfolioId, uuid: dto.accountUuid } },
    })

    if (!account) {
      throw new BadRequestException('accountUuid not found')
    }

    if (dto.portfolioSecurityUuid) {
      const security = await this.prisma.portfolioSecurity.findUnique({
        where: {
          portfolioId_uuid: { portfolioId, uuid: dto.portfolioSecurityUuid },
        },
      })

      if (!security) {
        throw new BadRequestException('portfolioSecurityUuid not found')
      }
    }

    if (dto.partnerTransactionUuid) {
      try {
        await this.getOne({
          portfolioId,
          transactionUuid: dto.partnerTransactionUuid,
        })
      } catch (e) {
        throw new BadRequestException('partnerTransactionUuid not found')
      }
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { portfolioId_uuid: { portfolioId, uuid } },
    })

    if (transaction) {
      return await this.update(portfolioId, uuid, dto)
    } else {
      return await this.create(portfolioId, uuid, dto)
    }
  }

  async create(
    portfolioId: number,
    uuid: string,
    {
      accountUuid,
      type,
      datetime,
      partnerTransactionUuid,
      units,
      shares,
      portfolioSecurityUuid,
      note,
      updatedAt,
    }: CreateUpdateTransactionDto,
  ) {
    // let partnerTransaction: Prisma.TransactionCreateNestedOneWithoutPartnerTransactionReverseInput = null
    // if (partnerTransactionUuid) {
    //   partnerTransaction = {
    //     connect: {
    //       portfolioId_uuid: { portfolioId, uuid: partnerTransactionUuid },
    //     },
    //   }
    // }

    // let portfolioSecurity: Prisma.PortfolioSecurityCreateNestedOneWithoutTransactionsInput = null
    // if (securityUuid) {
    //   portfolioSecurity = {
    //     connect: { portfolioId_uuid: { portfolioId, uuid: securityUuid } },
    //   }
    // }

    return await this.prisma.transaction.create({
      data: {
        uuid,
        type,
        datetime,
        note,
        shares,
        updatedAt,
        account: {
          connect: {
            portfolioId_uuid: { portfolioId, uuid: accountUuid },
          },
        },
        partnerTransactionUuid,
        portfolioSecurityUuid,
        portfolio: { connect: { id: portfolioId } },
        units: { createMany: { data: units } },
      },
      include: { units: defaultUnitsQuery },
    })
  }

  /**
   * Gets all transactions of portfolio
   */
  async getAll({ portfolioId }: PortfolioParams) {
    return await this.prisma.transaction.findMany({
      where: { portfolioId },
      include: { units: defaultUnitsQuery },
    })
  }

  /**
   * Gets all transactions of account
   */
  async getAllOfAccount({ portfolioId, accountUuid }: AccountParams) {
    return await this.prisma.transaction.findMany({
      where: { portfolioId, accountUuid },
      include: { units: defaultUnitsQuery },
    })
  }

  /**
   * Gets all transactions of security
   */
  async getAllOfSecurity({
    portfolioId,
    securityUuid,
  }: PortfolioSecurityParams) {
    return await this.prisma.transaction.findMany({
      where: { portfolioId, portfolioSecurityUuid: securityUuid },
      include: { units: defaultUnitsQuery },
    })
  }

  /**
   * Gets transaction of portfolio identified by parameters
   * or throws NotFoundException
   */
  async getOne({ transactionUuid, portfolioId }: TransactionParams) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { portfolioId_uuid: { portfolioId, uuid: transactionUuid } },
      include: {
        units: defaultUnitsQuery,
      },
    })

    if (!transaction) {
      throw new NotFoundException('Transaction not found')
    }

    return transaction
  }

  /**
   * Create, update and delete units of transaction
   */
  private async createUpdateDeleteUnits(
    portfolioId: number,
    transactionUuid: string,
    dtos: TransactionUnitDto[],
  ) {
    const dbs = await this.prisma.transactionUnit.findMany({
      where: { portfolioId, transactionUuid },
    })

    // Match elements of both arrays
    const {
      unmatchedLefts: unmatchedDtos,
      unmatchedRights: unmatchedDbs,
    } = matchArrays(
      dtos,
      dbs,
      (left, right) =>
        JSON.stringify([
          left.type,
          left.amount,
          left.currencyCode,
          left.originalAmount,
          left.originalCurrencyCode,
          left.exchangeRate,
        ]) ===
        JSON.stringify([
          right.type,
          right.amount,
          right.currencyCode,
          right.originalAmount,
          right.originalCurrencyCode,
          right.exchangeRate,
        ]),
    )

    // Delete removed units
    await this.prisma.transactionUnit.deleteMany({
      where: {
        id: { in: unmatchedDbs.map((u) => u.id) },
      },
    })

    // Create new units
    await this.prisma.transactionUnit.createMany({
      data: unmatchedDtos.map((u) => ({ ...u, portfolioId, transactionUuid })),
    })
  }

  /**
   * Updates transaction identified by parameters
   * or throws NotFoundException
   */
  async update(
    portfolioId: number,
    uuid: string,
    {
      accountUuid,
      type,
      datetime,
      partnerTransactionUuid,
      units,
      shares,
      portfolioSecurityUuid,
      note,
      updatedAt,
    }: CreateUpdateTransactionDto,
  ) {
    await this.createUpdateDeleteUnits(portfolioId, uuid, units)

    // let partnerTransaction: Prisma.TransactionCreateNestedOneWithoutPartnerTransactionReverseInput = null
    // if (partnerTransactionUuid) {
    //   partnerTransaction = {
    //     connect: {
    //       portfolioId_uuid: { portfolioId, uuid: partnerTransactionUuid },
    //     },
    //   }
    // }

    // let portfolioSecurity: Prisma.PortfolioSecurityCreateNestedOneWithoutTransactionsInput = null
    // if (securityUuid) {
    //   portfolioSecurity = {
    //     connect: { portfolioId_uuid: { portfolioId, uuid: securityUuid } },
    //   }
    // }

    return await this.prisma.transaction.update({
      data: {
        type,
        datetime,
        note,
        shares,
        updatedAt,
        account: {
          connect: {
            portfolioId_uuid: { portfolioId, uuid: accountUuid },
          },
        },
        partnerTransactionUuid,
        portfolioSecurityUuid,
      },
      where: { portfolioId_uuid: { portfolioId, uuid } },
      include: { units: defaultUnitsQuery },
    })
  }

  /**
   * Deletes transaction identified by parameters
   * or throws NotFoundException
   */
  async delete({ transactionUuid, portfolioId }: TransactionParams) {
    const transaction = await this.getOne({ portfolioId, transactionUuid })

    // Remove link from partner transaction (if exists)
    await this.prisma.transaction.updateMany({
      data: { partnerTransactionUuid: null },
      where: {
        portfolioId,
        partnerTransactionUuid: transactionUuid,
      },
    })

    await this.prisma
      .$executeRaw`DELETE FROM portfolios_transactions WHERE uuid=${transactionUuid} AND portfolio_id=${portfolioId}`

    return transaction
  }
}
