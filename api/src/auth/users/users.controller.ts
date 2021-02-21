import {
  Get,
  Body,
  Delete,
  Controller,
  UseGuards,
  HttpCode,
  Post,
  ForbiddenException,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiTags,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger'

import { DefaultAuthGuard } from '../default-auth.guard'
import { AuthUser } from '../auth.decorator'
import { UsersService } from './users.service'
import { UpdatePasswordDto } from '../dto/update.password.dto'
import { User } from './user.entity'

@Controller('auth/users')
@UseGuards(DefaultAuthGuard)
@ApiTags('auth/users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  /**
   * Gets current user
   */
  @Get('me')
  async getMe(@AuthUser() user: User): Promise<User> {
    return user
  }

  /**
   * Changes password of current user
   */
  @Post('me/password')
  @ApiForbiddenResponse({
    description: 'Password has not been changed. Existing password was wrong.',
  })
  async updateMyPassword(
    @AuthUser() user: User,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    if (
      !(await this.userService.verifyPassword(
        user,
        updatePasswordDto.oldPassword,
      ))
    ) {
      throw new ForbiddenException('Password is wrong.')
    }

    await this.userService.updatePassword(user, updatePasswordDto.newPassword)
  }

  /**
   * Deletes current user
   */
  @Delete('me')
  @HttpCode(204)
  async deleteMe(@AuthUser() user: User) {
    return await this.userService.delete(user.id)
  }
}
