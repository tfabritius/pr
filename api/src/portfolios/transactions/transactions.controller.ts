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
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
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
@ApiNotFoundResponse({ description: 'Portfolio not found' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class TransactionsController {
  constructor(public transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create transaction' })
  @ApiCreatedResponse({
    description: 'Transaction has been successfully created.',
    type: PortfolioTransaction,
  })
  async create(
    @Param() params: PortfolioParams,
    @Body() dto: TransactionDto,
    @Req() req,
  ): Promise<PortfolioTransaction> {
    return this.transactionsService.create(req.portfolio, dto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions of portfolio' })
  @ApiOkResponse({
    description: 'List of all transactions of portfolio is returned.',
    type: PortfolioTransaction,
    isArray: true,
  })
  async readAll(
    @Param() params: PortfolioParams,
  ): Promise<PortfolioTransaction[]> {
    return await this.transactionsService.getAll(params)
  }

  @Get(':transactionId')
  @ApiOperation({ summary: 'Get transaction' })
  @ApiOkResponse({
    description: 'The transaction is returned.',
    type: PortfolioTransaction,
  })
  @ApiNotFoundResponse({ description: 'Portfolio or transaction not found' })
  async readOne(
    @Param() params: TransactionParams,
  ): Promise<PortfolioTransaction> {
    return await this.transactionsService.getOne(params)
  }

  @Put(':transactionId')
  @ApiOperation({ summary: 'Update transaction' })
  @ApiOkResponse({
    description: 'The transaction has been successfully updated.',
  })
  @ApiNotFoundResponse({ description: 'Portfolio or transaction not found' })
  async update(
    @Param() params: TransactionParams,
    @Body() dto: TransactionDto,
  ) {
    return this.transactionsService.update(params, dto)
  }

  @Delete(':transactionId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete transaction' })
  @ApiNoContentResponse({
    description: 'The transaction has been successfully deleted.',
  })
  @ApiNotFoundResponse({ description: 'Portfolio or transaction not found' })
  async delete(@Param() params: TransactionParams) {
    await this.transactionsService.delete(params)
  }
}
