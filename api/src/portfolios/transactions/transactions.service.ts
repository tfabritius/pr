import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Transaction, TransactionUnit } from '@prisma/client'

import { AccountsService } from '../accounts/accounts.service'
import { Portfolio } from '../portfolio.entity'
import { PortfolioParams } from '../portfolio.params'
import { SecuritiesService } from '../securities/securities.service'
import { TransactionParams } from './transaction.params'
import { TransactionDto, TransactionUnitDto } from './transactions.dto'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountsService: AccountsService,
    private readonly securitiesService: SecuritiesService,
  ) {}

  /**
   * Make sure referenced entities exist and belong to this portfolio
   */
  private async checkOwnerOfReferences(
    portfolioId: number,
    dto: TransactionDto,
  ) {
    try {
      await this.accountsService.getOne({
        portfolioId,
        accountId: dto.accountId,
      })
      if (dto.partnerTransaction) {
        await this.accountsService.getOne({
          portfolioId,
          accountId: dto.partnerTransaction.accountId,
        })
      }
    } catch (e) {
      throw new BadRequestException('Account not found')
    }

    try {
      if (dto.securityId) {
        await this.securitiesService.getOne({
          portfolioId,
          securityId: dto.securityId,
        })
      }
      if (dto.partnerTransaction && dto.partnerTransaction.securityId) {
        await this.securitiesService.getOne({
          portfolioId,
          securityId: dto.partnerTransaction.securityId,
        })
      }
    } catch (e) {
      throw new BadRequestException('Security not found')
    }
  }

  /**
   * Creates transaction
   */
  async create(
    portfolio: Portfolio,
    dto: TransactionDto,
  ): Promise<Transaction & { units: TransactionUnit[] }> {
    const hasPartnerTransaction = !!dto.partnerTransaction

    await this.checkOwnerOfReferences(portfolio.id, dto)

    const {
      type,
      datetime,
      note,
      accountId,
      securityId,
      shares,
      units,
      partnerTransaction,
    } = dto

    let partnerTransactionId = null

    if (hasPartnerTransaction) {
      const createdPartnerTransaction = await this.prisma.transaction.create({
        data: {
          type,
          datetime,
          note,
          accountId: partnerTransaction.accountId,
          securityId: partnerTransaction.securityId,
          shares: partnerTransaction.shares,
          units: { createMany: { data: partnerTransaction.units } },
          portfolioId: portfolio.id,
        },
      })

      partnerTransactionId = createdPartnerTransaction.id
    }

    // Save the actual transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        type,
        datetime,
        note,
        accountId,
        securityId,
        shares,
        units: { createMany: { data: units } },
        portfolioId: portfolio.id,
        partnerTransactionId,
      },
      include: { units: true },
    })

    if (hasPartnerTransaction) {
      // Save id of transaction in partner transaction
      await this.prisma.transaction.update({
        data: { partnerTransactionId: transaction.id },
        where: { id: partnerTransactionId },
      })
    }

    return transaction
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
  async getOne({ transactionId, portfolioId }: TransactionParams) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, portfolioId },
      include: {
        partnerTransaction: { include: { units: true } },
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
    unitDtos: TransactionUnitDto[],
    transactionId: number,
  ) {
    // Delete units which are not in the DTO
    await this.prisma.transactionUnit.deleteMany({
      where: {
        id: { notIn: unitDtos.map((u) => u.id) },
        transactionId,
      },
    })

    // Create/update units
    for (const unit of unitDtos) {
      await this.prisma.transactionUnit.upsert({
        create: { ...unit, transactionId },
        update: unit,
        where: { id: unit.id },
      })
    }
  }

  /**
   * Updates transaction identified by parameters
   * or throws NotFoundException
   */
  async update(
    params: TransactionParams,
    dto: TransactionDto,
  ): Promise<Transaction> {
    const dtoHasPartnerTransaction = !!dto.partnerTransaction

    // Check if transaction exists in portfolio
    const transaction = await this.getOne(params)

    await this.checkOwnerOfReferences(params.portfolioId, dto)

    const {
      type,
      datetime,
      note,
      accountId,
      securityId,
      shares,
      units,
      partnerTransaction,
    } = dto

    // this.copyDtoToTransactions(dto, transaction, partnerTransaction)

    if (dtoHasPartnerTransaction) {
      // Update the partner transaction
      await this.prisma.transaction.update({
        data: {
          type,
          datetime,
          note,
          accountId: partnerTransaction.accountId,
          securityId: partnerTransaction.securityId,
          shares: partnerTransaction.shares,
        },
        where: { id: transaction.partnerTransactionId },
      })

      await this.createUpdateDeleteUnits(
        partnerTransaction.units,
        transaction.partnerTransactionId,
      )
    }

    await this.createUpdateDeleteUnits(units, transaction.id)

    // Update the transaction
    return await this.prisma.transaction.update({
      data: {
        type,
        datetime,
        note,
        accountId,
        securityId,
        shares,
      },
      where: { id: transaction.id },
    })
  }

  /**
   * Deletes transaction identified by parameters
   * or throws NotFoundException
   */
  async delete({
    transactionId,
    portfolioId,
  }: TransactionParams): Promise<void> {
    const affected = await this.prisma
      .$executeRaw`DELETE FROM transactions WHERE id=${transactionId} AND portfolio_id=${portfolioId}`

    if (affected == 0) {
      throw new NotFoundException('Transaction not found')
    }
  }
}
