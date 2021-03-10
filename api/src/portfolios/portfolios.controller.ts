import {
  Get,
  Controller,
  UseGuards,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger'

import { DefaultAuthGuard } from '../auth/default-auth.guard'
import { AuthUser } from '../auth/auth.decorator'
import { CreateUpdatePortfolioDto } from './dto/CreateUpdatePortfolio.dto'
import { Portfolio } from './portfolio.entity'
import { PortfolioGuard } from './portfolio.guard'
import { PortfolioParams } from './portfolio.params'
import { PortfoliosService } from './portfolios.service'
import { User } from '../auth/users/user.entity'

@Controller('portfolios')
@UseGuards(DefaultAuthGuard)
@ApiTags('portfolios')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class PortfoliosController {
  constructor(private readonly portfolios: PortfoliosService) {}

  /**
   * Creates portfolio
   */
  @Post()
  async create(
    @AuthUser() user: User,
    @Body() portfolioDto: CreateUpdatePortfolioDto,
  ): Promise<Portfolio> {
    return this.portfolios.create(user, portfolioDto)
  }

  /**
   * Gets list of all portfolios
   */
  @Get()
  async readAll(@AuthUser() user: User): Promise<Portfolio[]> {
    return await this.portfolios.getAllOfUser(user)
  }

  /**
   * Gets single portfolio
   */
  @Get(':portfolioId')
  @UseGuards(PortfolioGuard)
  @ApiNotFoundResponse({ description: 'Portfolio not found' })
  async readOne(@Param() params: PortfolioParams): Promise<Portfolio> {
    return await this.portfolios.getOne(params)
  }

  /**
   * Updates portfolio
   */
  @Put(':portfolioId')
  @UseGuards(PortfolioGuard)
  @ApiNotFoundResponse({ description: 'Portfolio not found' })
  async update(
    @Param() params: PortfolioParams,
    @Body() portfolioDto: CreateUpdatePortfolioDto,
  ): Promise<Portfolio> {
    return this.portfolios.update(params, portfolioDto)
  }

  /**
   * Deletes portfolio
   */
  @Delete(':portfolioId')
  @UseGuards(PortfolioGuard)
  @ApiNotFoundResponse({ description: 'Portfolio not found' })
  async delete(@Param() params: PortfolioParams): Promise<Portfolio> {
    return await this.portfolios.delete(params)
  }
}
