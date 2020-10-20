import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class DefaultAuthGuard extends AuthGuard('bearer-session') {}
