import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { DefaultAuthGuard } from '../../auth/default-auth.guard'
import { PortfolioGuard } from '../portfolio.guard'
import { CreateUpdateTransactionDto } from '../dto/CreateUpdateTransaction.dto'
import { TransactionParams } from './transaction.params'
import { TransactionsService } from './transactions.service'
import { PortfolioParams } from '../portfolio.params'
import { PortfolioTransaction } from './transaction.entity'
import { generateUuid } from '../../utils/uuid'

@Controller('portfolios/:portfolioId/transactions')
@UseGuards(DefaultAuthGuard, PortfolioGuard)
@ApiTags('portfolios/transactions')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiNotFoundResponse({ description: 'Portfolio or transaction not found' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class TransactionsController {
  constructor(public transactions: TransactionsService) {}

  /**
   * Creates transaction
   */
  @Post()
  async create(
    @Param() params: PortfolioParams,
    @Body() dto: CreateUpdateTransactionDto,
  ): Promise<PortfolioTransaction> {
    return this.transactions.upsert(
      { ...params, transactionUuid: generateUuid() },
      dto,
    )
  }

  /**
   * Gets list of all transactions of portfolio
   */
  @Get()
  async readAll(
    @Param() params: PortfolioParams,
  ): Promise<PortfolioTransaction[]> {
    return await this.transactions.getAll(params)
  }

  /**
   * Gets transaction
   */
  @Get(':transactionUuid')
  async readOne(
    @Param() params: TransactionParams,
  ): Promise<PortfolioTransaction> {
    return await this.transactions.getOne(params)
  }

  /**
   * Creates or updates transaction
   */
  @Put(':transactionUuid')
  async update(
    @Param() params: TransactionParams,
    @Body() dto: CreateUpdateTransactionDto,
  ): Promise<PortfolioTransaction> {
    return this.transactions.upsert(params, dto)
  }

  /**
   * Deletes transaction
   */
  @Delete(':transactionUuid')
  @HttpCode(204)
  async delete(@Param() params: TransactionParams) {
    await this.transactions.delete(params)
  }
}
