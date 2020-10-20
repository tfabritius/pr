import { Module } from '@nestjs/common'
import { SessionsController } from './sessions.controller'
import { SessionsService } from './sessions.service'

@Module({
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
