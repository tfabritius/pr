import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailerService implements OnModuleInit {
  private readonly logger = new Logger(MailerService.name)

  private transporter: nodemailer.Transporter

  async onModuleInit() {
    if (process.env.MAILER_TRANSPORT) {
      this.transporter = nodemailer.createTransport(
        process.env.MAILER_TRANSPORT,
      )
      this.logger.log('Initialized.')
    } else {
      this.transporter = nodemailer.createTransport({ sendmail: true })
      this.logger.log('Initialized (sendmail).')
    }
  }

  async sendMail(mailOptions: nodemailer.SendMailOptions) {
    this.logger.log('Sending email...')
    return this.transporter.sendMail(mailOptions)
  }
}
