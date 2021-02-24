import {
  Body,
  Controller,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MailerService } from '@nestjs-modules/mailer'
import { ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import util from 'util'

import { SendMailDto } from './send.mail.dto'

@Controller('contact')
@ApiTags('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name)

  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Sends an email to the configured contact person
   */
  @Post('/')
  async sendMail(
    @Body() { email, message, name, subject }: SendMailDto,
    @Req() req: Request,
  ) {
    try {
      const info = await this.mailer.sendMail({
        from: `"${name}" <${email}>`,
        to: this.config.get<string>('CONTACT_RECIPIENT_EMAIL'),
        headers: { 'X-Remote-IP': req.ip },
        subject: subject + ' (via Portfolio Report)',
        text: message,
      })

      this.logger.log('Email sent: ' + util.inspect(info))
      return { status: 'ok' }
    } catch (err) {
      this.logger.error('Error sending email: ' + util.inspect(err))
      throw new InternalServerErrorException()
    }
  }
}
