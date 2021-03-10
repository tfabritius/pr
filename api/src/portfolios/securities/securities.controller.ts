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
import { PortfolioGuard } from '../portfolio.guard'
import { CreateUpdatePortfolioSecurityDto } from '../dto/CreateUpdatePortfolioSecurity.dto'
import { PortfolioSecurityParams } from './security.params'
import { PortfolioSecuritiesService } from './securities.service'
import { PortfolioParams } from '../portfolio.params'
import { PortfolioSecurity } from './security.entity'
import { generateUuid } from '../../utils/uuid'

@Controller('portfolios/:portfolioId/securities')
@UseGuards(DefaultAuthGuard, PortfolioGuard)
@ApiTags('portfolios/securities')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiNotFoundResponse({ description: 'Portfolio or security not found' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class PortfolioSecuritiesController {
  constructor(public portfolioSecurities: PortfolioSecuritiesService) {}

  /**
   * Creates security in portfolio
   */
  @Post()
  async create(
    @Param() params: PortfolioParams,
    @Body() dto: CreateUpdatePortfolioSecurityDto,
  ): Promise<PortfolioSecurity> {
    return this.portfolioSecurities.upsert(
      { ...params, securityUuid: generateUuid() },
      dto,
    )
  }

  /**
   * Gets list of all securities of portfolio
   */
  @Get()
  async readAll(
    @Param() params: PortfolioParams,
  ): Promise<PortfolioSecurity[]> {
    return await this.portfolioSecurities.getAll(params)
  }

  /**
   * Gets security
   */
  @Get(':securityUuid')
  async readOne(
    @Param() params: PortfolioSecurityParams,
  ): Promise<PortfolioSecurity> {
    return await this.portfolioSecurities.getOne(params)
  }

  /**
   * Creates or updates security in portfolio
   */
  @Put(':securityUuid')
  async update(
    @Param() params: PortfolioSecurityParams,
    @Body() dto: CreateUpdatePortfolioSecurityDto,
  ): Promise<PortfolioSecurity> {
    return this.portfolioSecurities.upsert(params, dto)
  }

  /**
   * Delets security
   */
  @Delete(':securityUuid')
  async delete(
    @Param() params: PortfolioSecurityParams,
  ): Promise<PortfolioSecurity> {
    return await this.portfolioSecurities.delete(params)
  }
}
