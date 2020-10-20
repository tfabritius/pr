import { Body, Controller, Post } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { RegisterUserDto } from './auth.dto'
import { Session } from './sessions/session.entity'
import { SessionsService } from './sessions/sessions.service'
import { UsersService } from './users/users.service'

@Controller('auth')
@ApiTags('auth')
@ApiBadRequestResponse({ description: 'Bad request' })
@Controller('auth')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private sessionsService: SessionsService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register user' })
  @ApiCreatedResponse({
    description: 'User has been registered and logged in',
    type: Session,
  })
  async register(@Body() registerUserDto: RegisterUserDto): Promise<Session> {
    const user = await this.usersService.create(registerUserDto.username)
    await this.usersService.updatePassword(user, registerUserDto.password)
    const session = await this.sessionsService.create(user)
    return session
  }
}
