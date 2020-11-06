import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindConditions, In, Not, Repository } from 'typeorm'

import { AccountsService } from '../accounts/accounts.service'
import { Portfolio } from '../portfolio.entity'
import { PortfolioParams } from '../portfolio.params'
import { SecuritiesService } from '../securities/securities.service'
import { Transaction } from './transaction.entity'
import { TransactionParams } from './transaction.params'
import { TransactionDto, TransactionUnitDto } from './transactions.dto'
import { TransactionUnit } from './unit.entity'

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,

    @InjectRepository(TransactionUnit)
    private readonly unitsRepository: Repository<TransactionUnit>,

    private readonly accountsService: AccountsService,
    private readonly securitiesService: SecuritiesService,
  ) {}

  /**
   * Copies relevant attributes from dto to account object
   */
  private copyDtoToTransactions(
    dto: TransactionDto,
    transaction: Transaction,
    partnerTransaction: Transaction,
  ) {
    // Copy attributes which are identical for both transactions
    for (const i of ['type', 'datetime', 'note']) {
      transaction[i] = dto[i] ?? null
      if (dto.partnerTransaction) {
        partnerTransaction[i] = dto[i] ?? null
      }
    }

    // Copy attributes which differ between both transactions
    for (const i of ['account', 'security', 'shares', 'units']) {
      transaction[i] = dto[i] ?? null
      if (dto.partnerTransaction) {
        partnerTransaction[i] = dto.partnerTransaction[i] ?? null
      }
    }
  }

  /**
   * Creates transaction
   */
  async create(
    portfolio: Portfolio,
    dto: TransactionDto,
  ): Promise<Transaction> {
    const hasPartnerTransaction = !!dto.partnerTransaction

    // Make sure referenced entities exist and belong to this portfolio
    try {
      await this.accountsService.getOne({
        portfolioId: portfolio.id,
        accountId: dto.account.id,
      })
      if (hasPartnerTransaction) {
        await this.accountsService.getOne({
          portfolioId: portfolio.id,
          accountId: dto.partnerTransaction.account.id,
        })
      }
    } catch (e) {
      throw new BadRequestException('Account not found')
    }

    try {
      if (dto.security) {
        await this.securitiesService.getOne({
          portfolioId: portfolio.id,
          securityId: dto.security.id,
        })
      }
      if (hasPartnerTransaction && dto.partnerTransaction.security) {
        await this.securitiesService.getOne({
          portfolioId: portfolio.id,
          securityId: dto.partnerTransaction.security.id,
        })
      }
    } catch (e) {
      throw new BadRequestException('Security not found')
    }

    let transaction = new Transaction()
    transaction.portfolio = portfolio
    let partnerTransaction = new Transaction()
    partnerTransaction.portfolio = portfolio

    this.copyDtoToTransactions(dto, transaction, partnerTransaction)

    if (hasPartnerTransaction) {
      partnerTransaction = await this.transactionsRepository.save(
        partnerTransaction,
      )

      transaction.partnerTransaction = partnerTransaction
    }

    // Save the actual transaction
    transaction = await this.transactionsRepository.save(transaction)

    if (hasPartnerTransaction) {
      // Save id of transaction in partner transaction
      partnerTransaction.partnerTransaction = transaction
      await this.transactionsRepository.save(partnerTransaction)

      // Replace partner transaction with id to avoid circular reference
      transaction.partnerTransaction = {
        id: transaction.partnerTransaction.id,
      } as Transaction
    }

    return transaction
  }

  /**
   * Gets all transactions of portfolio
   */
  async getAll(params: PortfolioParams): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      relations: [
        'account',
        'partnerTransaction',
        'partnerTransaction.account',
      ],
      where: {
        portfolio: { id: params.portfolioId },
      },
    })
  }

  /**
   * Gets transaction of portfolio identified by parameters
   * or throws NotFoundException
   */
  async getOne(params: TransactionParams): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      relations: [
        'account',
        'security',
        'partnerTransaction',
        'partnerTransaction.account',
        'partnerTransaction.security',
      ],
      where: {
        id: params.transactionId,
        portfolio: { id: params.portfolioId },
      },
    })

    if (!transaction) {
      throw new NotFoundException('Transaction not found')
    }

    return transaction
  }

  /**
   * Deletes transaction units which are not in the provided list of units
   * (for a given transaction)
   */
  async deleteRemovedTransactionUnits(
    transaction: Transaction,
    unitsDto: TransactionUnitDto[],
  ) {
    const dtoTransactionUnitsIds = unitsDto
      .map((el) => el.id)
      .filter((el) => !!el)

    const deleteConditions: FindConditions<TransactionUnit> = {
      transaction,
    }

    if (dtoTransactionUnitsIds.length > 0) {
      deleteConditions.id = Not(In(dtoTransactionUnitsIds))
    }
    await this.unitsRepository.delete(deleteConditions)
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
    let transaction = await this.getOne(params)

    // Workaround for https://github.com/typeorm/typeorm/issues/1351
    await this.deleteRemovedTransactionUnits(transaction, dto.units)
    if (dtoHasPartnerTransaction) {
      await this.deleteRemovedTransactionUnits(
        transaction.partnerTransaction,
        dto.partnerTransaction.units,
      )
    }

    // Get transaction from db without deleted units
    transaction = await this.getOne(params)
    const partnerTransaction = transaction.partnerTransaction

    this.copyDtoToTransactions(dto, transaction, partnerTransaction)

    if (dtoHasPartnerTransaction) {
      await this.transactionsRepository.save(partnerTransaction)
    }
    return await this.transactionsRepository.save(transaction)
  }

  /**
   * Deletes transaction identified by parameters
   * or throws NotFoundException
   */
  async delete(params: TransactionParams): Promise<void> {
    const { affected } = await this.transactionsRepository.delete({
      id: params.transactionId,
      portfolio: { id: params.portfolioId },
    })

    if (affected == 0) {
      throw new NotFoundException('Transaction not found')
    }
  }
}
