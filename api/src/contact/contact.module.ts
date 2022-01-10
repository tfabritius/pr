import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { ContactController } from './contact.controller'
import { MailerService } from './mailer.service'

@Module({
  imports: [ConfigModule],
  providers: [MailerService],
  controllers: [ContactController],
  exports: [],
})
export class ContactModule {}
