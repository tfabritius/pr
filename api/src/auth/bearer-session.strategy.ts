import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-http-bearer'
import { User } from '@prisma/client'

import { SessionsService } from './sessions/sessions.service'

@Injectable()
export class BearerSessionStrategy extends PassportStrategy(
  Strategy,
  'bearer-session',
) {
  constructor(private sessionsService: SessionsService) {
    super()
  }

  async validate(token: string): Promise<User> {
    const user = await this.sessionsService.validateToken(token)
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }
}
