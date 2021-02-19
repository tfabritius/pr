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
import { SecurityDto } from './securities.dto'
import { SecurityParams } from './security.params'
import { SecuritiesService } from './securities.service'
import { SecuritiesKpisService } from './securities.kpis.service'
import { PortfolioParams } from '../portfolio.params'
import { PortfolioSecurity } from './security.entity'

@Controller('portfolios/:portfolioId/securities')
@UseGuards(DefaultAuthGuard, PortfolioGuard)
@ApiTags('portfolios/securities')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiNotFoundResponse({ description: 'Portfolio not found' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class SecuritiesController {
  constructor(
    public securitiesService: SecuritiesService,
    private readonly kpisService: SecuritiesKpisService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create security' })
  @ApiCreatedResponse({
    description: 'Security has been successfully created.',
    type: PortfolioSecurity,
  })
  async create(
    @Param() params: PortfolioParams,
    @Body() securityDto: SecurityDto,
    @Req() req,
  ): Promise<PortfolioSecurity> {
    return this.securitiesService.create(req.portfolio, securityDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all securities of portfolio' })
  @ApiOkResponse({
    description: 'List of all securities of portfolio is returned.',
    type: PortfolioSecurity,
    isArray: true,
  })
  async readAll(
    @Param() params: PortfolioParams,
  ): Promise<PortfolioSecurity[]> {
    return await this.securitiesService.getAll(params)
  }

  @Get(':securityId')
  @ApiOperation({ summary: 'Get security' })
  @ApiOkResponse({
    description: 'The security is returned.',
    type: PortfolioSecurity,
  })
  @ApiNotFoundResponse({ description: 'Portfolio or security not found' })
  async readOne(@Param() params: SecurityParams): Promise<PortfolioSecurity> {
    return await this.securitiesService.getOne(params)
  }

  @Put(':securityId')
  @ApiOperation({ summary: 'Update security' })
  @ApiOkResponse({
    description: 'The security has been successfully updated.',
  })
  @ApiNotFoundResponse({ description: 'Portfolio or security not found' })
  async update(
    @Param() params: SecurityParams,
    @Body() securityDto: SecurityDto,
  ) {
    return this.securitiesService.update(params, securityDto)
  }

  @Delete(':securityId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete security' })
  @ApiNoContentResponse({
    description: 'The security has been successfully deleted.',
  })
  @ApiNotFoundResponse({ description: 'Portfolio or security not found' })
  async delete(@Param() params: SecurityParams) {
    await this.securitiesService.delete(params)
  }
}
