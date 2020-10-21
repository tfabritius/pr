import {
  Get,
  Controller,
  UseGuards,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger'

import { DefaultAuthGuard } from '../auth/default-auth.guard'
import { AuthUser } from '../auth/auth.decorator'
import { Portfolio } from './portfolio.entity'
import { PortfolioDto } from './portfolios.dto'
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
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Post()
  @ApiOperation({ summary: 'Create portfolio' })
  @ApiCreatedResponse({
    description: 'The portfolio has been successfully created.',
    type: Portfolio,
  })
  async create(
    @AuthUser() user: User,
    @Body() portfolioDto: PortfolioDto,
  ): Promise<Portfolio> {
    return this.portfoliosService.create(user, portfolioDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all portfolios' })
  @ApiOkResponse({
    description: 'List of all portfolios is returned.',
    type: Portfolio,
    isArray: true,
  })
  async readAll(@AuthUser() user: User): Promise<Portfolio[]> {
    return await this.portfoliosService.getAllOfUser(user)
  }

  @Get(':portfolioId')
  @UseGuards(PortfolioGuard)
  @ApiOperation({ summary: 'Get portfolio' })
  @ApiOkResponse({
    description: 'The portfolio is returned.',
    type: Portfolio,
  })
  @ApiNotFoundResponse({ description: 'Portfolio not found' })
  async readOne(@Param() params: PortfolioParams): Promise<Portfolio> {
    return await this.portfoliosService.getOne(params)
  }

  @Put(':portfolioId')
  @UseGuards(PortfolioGuard)
  @ApiOperation({ summary: 'Update portfolio' })
  @ApiOkResponse({
    description: 'The portfolio has been successfully updated.',
  })
  @ApiNotFoundResponse({ description: 'Portfolio not found' })
  async update(
    @Param() params: PortfolioParams,
    @Body() portfolioDto: PortfolioDto,
  ) {
    return this.portfoliosService.update(params, portfolioDto)
  }

  @Delete(':portfolioId')
  @HttpCode(204)
  @UseGuards(PortfolioGuard)
  @ApiOperation({ summary: 'Delete portfolio' })
  @ApiNoContentResponse({
    description: 'The portfolio has been successfully deleted.',
  })
  @ApiNotFoundResponse({ description: 'Portfolio not found' })
  async delete(@Param() params: PortfolioParams) {
    await this.portfoliosService.delete(params)
  }
}
