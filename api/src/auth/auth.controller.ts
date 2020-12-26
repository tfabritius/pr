import {
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Request } from 'express'

import { LoginUserDto, RegisterUserDto } from './auth.dto'
import { DefaultAuthGuard } from './default-auth.guard'
import { Session } from './sessions/session.entity'
import { SessionsService } from './sessions/sessions.service'
import { UsersService } from './users/users.service'

@Controller('auth')
@ApiTags('auth')
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

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
    this.sessionsService.cleanupExpired().catch((e) => {
      this.logger.error(
        `Error while cleaning up expired sessions in background: ${e}`,
      )
    })

    return session
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(DefaultAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiNoContentResponse({
    description: 'The session has been successfully deleted.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async delete(@Req() req: Request) {
    // Extract session id from Authorization header
    const token = (req.headers['authorization'] as string).split(' ', 2)[1]

    await this.sessionsService.delete(token)
  }
}
