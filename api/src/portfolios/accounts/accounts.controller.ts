import {
  Body,
  Controller,
  Delete,
  Get,
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
import { Account } from './account.entity'
import { PortfolioGuard } from '../portfolio.guard'
import { CreateUpdateAccountDto } from '../dto/CreateUpdateAccount.dto'
import { AccountParams } from './account.params'
import { AccountsService } from './accounts.service'
import { PortfolioParams } from '../portfolio.params'
import { generateUuid } from '../../utils/uuid'

@Controller('portfolios/:portfolioId/accounts')
@UseGuards(DefaultAuthGuard, PortfolioGuard)
@ApiTags('portfolios/accounts')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiNotFoundResponse({ description: 'Portfolio or account not found' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class AccountsController {
  constructor(public accounts: AccountsService) {}

  /**
   * Creates account
   */
  @Post()
  async create(
    @Param() params: PortfolioParams,
    @Body() dto: CreateUpdateAccountDto,
  ): Promise<Account> {
    return this.accounts.upsert({ ...params, accountUuid: generateUuid() }, dto)
  }

  /**
   * Gets list of all accounts of portfolio
   */
  @Get()
  async readAll(@Param() params: PortfolioParams): Promise<Account[]> {
    return await this.accounts.getAll(params)
  }

  /**
   * Gets account
   */
  @Get(':accountUuid')
  async readOne(@Param() params: AccountParams): Promise<Account> {
    return await this.accounts.getOne(params)
  }

  /**
   * Creates or updates account
   */
  @Put(':accountUuid')
  async update(
    @Param() params: AccountParams,
    @Body() dto: CreateUpdateAccountDto,
  ): Promise<Account> {
    return this.accounts.upsert(params, dto)
  }

  /**
   * Deletes account
   */
  @Delete(':accountUuid')
  async delete(@Param() params: AccountParams): Promise<Account> {
    return await this.accounts.delete(params)
  }
}
