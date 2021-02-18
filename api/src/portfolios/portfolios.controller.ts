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
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger'

import { DefaultAuthGuard } from '../auth/default-auth.guard'
import { AuthUser } from '../auth/auth.decorator'
import { PortfolioDto } from './portfolios.dto'
import { PortfolioGuard } from './portfolio.guard'
import { PortfolioParams } from './portfolio.params'
import { PortfoliosService } from './portfolios.service'
import { User } from '../auth/users/user.entity'
import { PortfolioResponseDto } from './dto/portfolio.response.dto'

@Controller('portfolios')
@UseGuards(DefaultAuthGuard)
@ApiTags('portfolios')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Post()
  @ApiOperation({ summary: 'Create portfolio' })
  @ApiCreatedResponse({
    description: 'The portfolio has been successfully created.',
    type: PortfolioResponseDto,
  })
  async create(
    @AuthUser() user: User,
    @Body() portfolioDto: PortfolioDto,
  ): Promise<PortfolioResponseDto> {
    return this.portfoliosService.create(user, portfolioDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all portfolios' })
  @ApiOkResponse({
    description: 'List of all portfolios is returned.',
    type: PortfolioResponseDto,
    isArray: true,
  })
  async readAll(@AuthUser() user: User): Promise<PortfolioResponseDto[]> {
    return await this.portfoliosService.getAllOfUser(user)
  }

  @Get(':portfolioId')
  @UseGuards(PortfolioGuard)
  @ApiOperation({ summary: 'Get portfolio' })
  @ApiOkResponse({
    description: 'The portfolio is returned.',
    type: PortfolioResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Portfolio not found' })
  async readOne(
    @Param() params: PortfolioParams,
  ): Promise<PortfolioResponseDto> {
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
