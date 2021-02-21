import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
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
import { TransactionDto } from './transactions.dto'
import { TransactionParams } from './transaction.params'
import { TransactionsService } from './transactions.service'
import { PortfolioParams } from '../portfolio.params'
import { PortfolioTransaction } from './transaction.entity'

@Controller('portfolios/:portfolioId/transactions')
@UseGuards(DefaultAuthGuard, PortfolioGuard)
@ApiTags('portfolios/transactions')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiNotFoundResponse({ description: 'Portfolio or transaction not found' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class TransactionsController {
  constructor(public transactionsService: TransactionsService) {}

  /**
   * Creates transaction
   */
  @Post()
  async create(
    @Param() params: PortfolioParams,
    @Body() dto: TransactionDto,
    @Req() req,
  ): Promise<PortfolioTransaction> {
    return this.transactionsService.create(req.portfolio, dto)
  }

  /**
   * Gets list of all transactions of portfolio
   */
  @Get()
  async readAll(
    @Param() params: PortfolioParams,
  ): Promise<PortfolioTransaction[]> {
    return await this.transactionsService.getAll(params)
  }

  /**
   * Gets transaction
   */
  @Get(':transactionId')
  async readOne(
    @Param() params: TransactionParams,
  ): Promise<PortfolioTransaction> {
    return await this.transactionsService.getOne(params)
  }

  /**
   * Updates transaction
   */
  @Put(':transactionId')
  async update(
    @Param() params: TransactionParams,
    @Body() dto: TransactionDto,
  ): Promise<PortfolioTransaction> {
    return this.transactionsService.update(params, dto)
  }

  /**
   * Deletes transaction
   */
  @Delete(':transactionId')
  @HttpCode(204)
  async delete(@Param() params: TransactionParams) {
    await this.transactionsService.delete(params)
  }
}
