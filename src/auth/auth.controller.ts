import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { LoginUserDto, RegisterUserDto } from './auth.dto'
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

  @Post('login')
  @UseGuards(AuthGuard('local'))
  @ApiOperation({
    summary: 'Login user',
  })
  @ApiCreatedResponse({
    description: 'The user has been successfully logged in.',
    type: Session,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async login(
    @Req() req,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() loginUserDto: LoginUserDto,
  ): Promise<Session> {
    const session = await this.sessionsService.create(req.user)

    // Start cleanup in background
    this.sessionsService.cleanupExpired()

    return session
  }
}
