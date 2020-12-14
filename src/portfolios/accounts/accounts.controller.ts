import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
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
  ApiPropertyOptional,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { DefaultAuthGuard } from '../../auth/default-auth.guard'
import { PortfolioGuard } from '../portfolio.guard'
import { Account } from './account.entity'
import { AccountDto } from './accounts.dto'
import { AccountParams } from './account.params'
import { AccountsService } from './accounts.service'
import { AccountsKpisService } from './accounts.kpis.service'
import { PortfolioParams } from '../portfolio.params'
import { IsOptional, IsBoolean } from 'class-validator'
import { Transform } from 'class-transformer'

export class AccountQuery {
  @IsOptional()
  @Transform((value) => value === 'true', { toClassOnly: true })
  @IsBoolean()
  @ApiPropertyOptional()
  readonly kpis?: boolean
}

@Controller('portfolios/:portfolioId/accounts')
@UseGuards(DefaultAuthGuard, PortfolioGuard)
@ApiTags('portfolios/accounts')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiNotFoundResponse({ description: 'Portfolio not found' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class AccountsController {
  constructor(
    public service: AccountsService,
    private readonly kpisService: AccountsKpisService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create account' })
  @ApiCreatedResponse({
    description: 'Account has been successfully created.',
    type: Account,
  })
  async create(
    @Param() params: PortfolioParams,
    @Body() dto: AccountDto,
    @Req() req,
  ): Promise<Account> {
    return this.service.create(req.portfolio, dto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts of portfolio' })
  @ApiOkResponse({
    description: 'List of all accounts of portfolio is returned.',
    type: Account,
    isArray: true,
  })
  async readAll(
    @Param() params: PortfolioParams,
    @Query() query: AccountQuery,
  ): Promise<Account[]> {
    const accounts = await this.service.getAll(params)
    if (query.kpis) {
      for (const account of accounts) {
        account.kpis = await this.kpisService.getKpis(account)
      }
    }
    return accounts
  }

  @Get(':accountId')
  @ApiOperation({ summary: 'Get account' })
  @ApiOkResponse({
    description: 'The account is returned.',
    type: Account,
  })
  @ApiNotFoundResponse({
    description: 'Portfolio or account not found',
  })
  async readOne(
    @Param() params: AccountParams,
    @Query() query: AccountQuery,
  ): Promise<Account> {
    const account = await this.service.getOne(params)
    if (query.kpis) {
      account.kpis = await this.kpisService.getKpis(account)
    }
    return account
  }

  @Put(':accountId')
  @ApiOperation({ summary: 'Update account' })
  @ApiOkResponse({
    description: 'The account has been successfully updated.',
  })
  @ApiNotFoundResponse({
    description: 'Portfolio or account not found',
  })
  async update(@Param() params: AccountParams, @Body() dto: AccountDto) {
    return this.service.update(params, dto)
  }

  @Delete(':accountId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete account' })
  @ApiNoContentResponse({
    description: 'The account has been successfully deleted.',
  })
  @ApiNotFoundResponse({
    description: 'Portfolio or account not found',
  })
  async delete(@Param() params: AccountParams) {
    await this.service.delete(params)
  }
}
