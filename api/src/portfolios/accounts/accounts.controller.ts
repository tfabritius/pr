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
import { Account } from './account.entity'
import { PortfolioGuard } from '../portfolio.guard'
import { AccountDto } from './accounts.dto'
import { AccountParams } from './account.params'
import { AccountsService } from './accounts.service'
import { AccountsKpisService } from './accounts.kpis.service'
import { PortfolioParams } from '../portfolio.params'

@Controller('portfolios/:portfolioId/accounts')
@UseGuards(DefaultAuthGuard, PortfolioGuard)
@ApiTags('portfolios/accounts')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiNotFoundResponse({ description: 'Portfolio or account not found' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class AccountsController {
  constructor(
    public service: AccountsService,
    private readonly kpisService: AccountsKpisService,
  ) {}

  /**
   * Creates account
   */
  @Post()
  async create(
    @Param() params: PortfolioParams,
    @Body() dto: AccountDto,
    @Req() req,
  ): Promise<Account> {
    return this.service.create(req.portfolio, dto)
  }

  /**
   * Gets list of all accounts of portfolio
   */
  @Get()
  async readAll(@Param() params: PortfolioParams): Promise<Account[]> {
    return await this.service.getAll(params)
  }

  /**
   * Gets account
   */
  @Get(':accountId')
  async readOne(@Param() params: AccountParams): Promise<Account> {
    return await this.service.getOne(params)
  }

  /**
   * Updates account
   */
  @Put(':accountId')
  async update(@Param() params: AccountParams, @Body() dto: AccountDto) {
    return this.service.update(params, dto)
  }

  /**
   * Deletes account
   */
  @Delete(':accountId')
  @HttpCode(204)
  async delete(@Param() params: AccountParams) {
    await this.service.delete(params)
  }
}
