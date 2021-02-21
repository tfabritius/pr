import { Controller, Get, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { User } from '@prisma/client'

import { AuthUser } from '../auth.decorator'
import { DefaultAuthGuard } from '../default-auth.guard'
import { Session } from './session.entity'
import { SessionsService } from './sessions.service'

@Controller('auth/sessions')
@UseGuards(DefaultAuthGuard)
@ApiTags('auth/sessions')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  /**
   * Gets list of all sessions
   */
  @Get()
  async readAll(@AuthUser() user: User): Promise<Session[]> {
    return await this.sessionsService.getAllOfUser(user)
  }
}
