import {
  Get,
  Controller,
  Param,
  Body,
  Post,
  BadRequestException,
  Patch,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common'
import {
  ApiTags,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { AdminGuard } from '../auth/admin.guard'
import { DefaultAuthGuard } from '../auth/default-auth.guard'

import { PrismaService } from '../prisma.service'
import { generateUuid } from '../utils/uuid'

@Controller('taxonomies')
@ApiTags('taxonomies')
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class TaxonomiesController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gets all taxonomies
   */
  @Get('/')
  async getAll() {
    return await this.prisma.taxonomy.findMany()
  }

  /**
   * Gets single taxonomy with all descendants
   */
  @Get('/:uuid')
  async getOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return await this.prisma.taxonomy.findUnique({
      where: { uuid },
      include: { descendants: true },
    })
  }

  /**
   * Creates taxonomy
   */
  @Post('/')
  @UseGuards(DefaultAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async create(
    @Body('name') name: string,
    @Body('code') code: string,
    @Body('parentUuid') parentUuid?: string,
  ) {
    const data: Prisma.TaxonomyCreateInput = {
      uuid: generateUuid(),
      name,
      code,
    }

    if (parentUuid) {
      const parent = await this.prisma.taxonomy.findUnique({
        where: { uuid: parentUuid },
      })
      if (!parent) {
        throw new BadRequestException('parentUuid invalid')
      }

      data.parent = { connect: { uuid: parent.uuid } }
      data.root = { connect: { uuid: parent.rootUuid || parent.uuid } }
    }

    return await this.prisma.taxonomy.create({ data })
  }

  /**
   * Update taxonomy
   */
  @Patch('/:uuid')
  @UseGuards(DefaultAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() body: { name?: string; parentUuid?: string; code?: string },
  ) {
    const data: Prisma.TaxonomyUpdateInput = {}

    if (typeof body.name === 'string') {
      data.name = body.name
    }

    if (typeof body.parentUuid === 'string') {
      const parent = await this.prisma.taxonomy.findUnique({
        where: { uuid: body.parentUuid },
      })
      if (!parent) {
        throw new BadRequestException('parentUuid invalid')
      }

      if (parent.uuid.replace(/-/g, '') === uuid.replace(/-/g, '')) {
        throw new BadRequestException(
          'parentUuid must be different from own uuid',
        )
      }

      data.parent = { connect: { uuid: parent.uuid } }
      data.root = { connect: { uuid: parent.rootUuid || parent.uuid } }
    }

    if (typeof body.code === 'string') {
      data.code = body.code
    }

    // Null values are only allowed for root nodes
    if (data.parent && body.code === null) {
      data.code = ''
    }

    return await this.prisma.taxonomy.update({
      where: { uuid },
      data,
    })
  }

  /**
   * Deletes taxonomy
   */
  @Delete('/:uuid')
  @UseGuards(DefaultAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async delete(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return await this.prisma.taxonomy.delete({ where: { uuid } })
  }
}
