import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { SessionsController } from './sessions.controller'
import { SessionsService } from './sessions.service'
import { UsersModule } from '../users/users.module'
import { PrismaService } from '../../prisma.service'

@Module({
  imports: [ConfigModule, UsersModule],
  controllers: [SessionsController],
  providers: [SessionsService, PrismaService],
  exports: [SessionsService],
})
export class SessionsModule {}
