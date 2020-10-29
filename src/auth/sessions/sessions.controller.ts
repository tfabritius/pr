import { Controller, Get, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { AuthUser } from '../auth.decorator'
import { DefaultAuthGuard } from '../default-auth.guard'
import { User } from '../users/user.entity'
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

  @Get()
  @ApiOperation({ summary: 'Get all sessions' })
  @ApiOkResponse({
    description: 'List of all sessions is returned.',
    type: Session,
    isArray: true,
  })
  async readAll(@AuthUser() user: User): Promise<Session[]> {
    return await this.sessionsService.getAllOfUser(user)
  }
}
