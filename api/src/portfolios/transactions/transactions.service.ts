import { Injectable, NotFoundException } from '@nestjs/common'
import { Transaction, TransactionUnit } from '@prisma/client'

import { AccountsService } from '../accounts/accounts.service'
import { PortfolioParams } from '../portfolio.params'
import { SecuritiesService } from '../securities/securities.service'
import { TransactionParams } from './transaction.params'
import {
  CreateUpdateTransactionDto,
  TransactionUnitDto,
} from './transactions.dto'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountsService: AccountsService,
    private readonly securitiesService: SecuritiesService,
  ) {}

  /**
   * Creates or updates transaction
   */
  async upsert(
    { portfolioId, transactionUuid: uuid }: TransactionParams,
    dto: CreateUpdateTransactionDto,
  ): Promise<Transaction & { units: TransactionUnit[] }> {
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
      include: { units: true },
    })
  }

  /**
   * Gets all transactions of portfolio
   */
  async getAll({ portfolioId }: PortfolioParams) {
    return await this.prisma.transaction.findMany({
      where: { portfolioId },
      include: { units: true },
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
        units: true,
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
    unitDtos: TransactionUnitDto[],
  ) {
    // Delete units which are not in the DTO
    await this.prisma.transactionUnit.deleteMany({
      where: {
        id: { notIn: unitDtos.map((u) => u.id) },
        portfolioId,
        transactionUuid,
      },
    })

    // Create units without id
    await this.prisma.transactionUnit.createMany({
      data: unitDtos
        .filter((u) => !u.id)
        .map((u) => ({ ...u, portfolioId, transactionUuid })),
    })

    // Update units with id
    for (const unit of unitDtos.filter((u) => u.id)) {
      await this.prisma.transactionUnit.update({
        data: unit,
        where: { id: unit.id },
      })
    }
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
        account: {
          connect: {
            portfolioId_uuid: { portfolioId, uuid: accountUuid },
          },
        },
        partnerTransactionUuid,
        portfolioSecurityUuid,
      },
      where: { portfolioId_uuid: { portfolioId, uuid } },
      include: { units: true },
    })
  }

  /**
   * Deletes transaction identified by parameters
   * or throws NotFoundException
   */
  async delete({
    transactionUuid,
    portfolioId,
  }: TransactionParams): Promise<void> {
    const affected = await this.prisma
      .$executeRaw`DELETE FROM portfolios_transactions WHERE uuid=${transactionUuid} AND portfolio_id=${portfolioId}`

    if (affected == 0) {
      throw new NotFoundException('Transaction not found')
    }
  }
}
