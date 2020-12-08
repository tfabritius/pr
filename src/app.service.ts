import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getOk() {
    return { statusCode: 200, message: 'ok' }
  }
}
