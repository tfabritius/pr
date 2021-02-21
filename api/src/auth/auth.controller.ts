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
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Request } from 'express'

import { LoginUserDto } from './dto/login.user.dto'
import { RegisterUserDto } from './dto/register.user.dto'
import { DefaultAuthGuard } from './default-auth.guard'
import { SessionsService } from './sessions/sessions.service'
import { UsersService } from './users/users.service'
import { Session } from './sessions/session.entity'

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

  /**
   * Registers user
   *
   * User is automatically logged in and session is returned.
   */
  @Post('register')
  async register(
    @Body() registerUserDto: RegisterUserDto,
    @Req() req,
  ): Promise<Session> {
    const user = await this.usersService.create(registerUserDto.username)
    await this.usersService.updatePassword(user, registerUserDto.password)
    const session = await this.sessionsService.create(user, {
      note: req.headers['user-agent'],
    })
    return session
  }

  /**
   * Logs in user
   *
   * Session is returned.
   * @param req
   * @param loginUserDto
   */
  @Post('login')
  @UseGuards(AuthGuard('local'))
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async login(
    @Req() req,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() loginUserDto: LoginUserDto,
  ): Promise<Session> {
    const session = await this.sessionsService.create(req.user, {
      note: req.headers['user-agent'],
    })

    // Start cleanup in background
    this.sessionsService.cleanupExpired().catch((e) => {
      this.logger.error(
        `Error while cleaning up expired sessions in background: ${e}`,
      )
    })

    return session
  }

  /**
   * Logs out user
   *
   * Session is deleted.
   */
  @Post('logout')
  @HttpCode(204)
  @UseGuards(DefaultAuthGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async delete(@Req() req: Request) {
    // Extract session id from Authorization header
    const token = (req.headers['authorization'] as string).split(' ', 2)[1]

    await this.sessionsService.delete(token)
  }
}
