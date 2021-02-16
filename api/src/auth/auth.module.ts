import { Module } from '@nestjs/common'

import { AuthResolver } from './auth.resolver'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from './users/users.module'
import { SessionsModule } from './sessions/sessions.module'
import { LocalStrategy } from './local.strategy'
import { BearerSessionStrategy } from './bearer-session.strategy'

@Module({
  providers: [AuthResolver, AuthService, LocalStrategy, BearerSessionStrategy],
  controllers: [AuthController],
  imports: [UsersModule, SessionsModule],
})
export class AuthModule {}
