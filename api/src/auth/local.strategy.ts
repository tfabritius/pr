import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { User } from '@prisma/client'

import { AuthService } from './auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'username', passwordField: 'password' })
  }

  async validate(username: string, password: string): Promise<User> {
    const user = await this.authService.validateUsernamePassword(
      username,
      password,
    )
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }
}
