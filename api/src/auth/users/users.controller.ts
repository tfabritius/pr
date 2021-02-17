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
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiTags,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger'
import { User } from '@prisma/client'

import { DefaultAuthGuard } from '../default-auth.guard'
import { AuthUser } from '../auth.decorator'
import { UsersService } from './users.service'
import { UpdatePasswordDto } from '../dto/update.password.dto'
import { UserResponseDto } from '../dto/user.response.dto'

@Controller('auth/users')
@UseGuards(DefaultAuthGuard)
@ApiTags('auth/users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBadRequestResponse({ description: 'Bad request' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiOkResponse({
    description: 'The user is returned.',
    type: UserResponseDto,
  })
  async getMe(@AuthUser() user: User): Promise<UserResponseDto> {
    return new UserResponseDto(user)
  }

  @Post('me/password')
  @ApiOperation({ summary: 'Change password of current user' })
  @ApiCreatedResponse({
    description: 'Password of current user has been successfully changed.',
  })
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

  @Delete('me')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete current user' })
  @ApiNoContentResponse({
    description: 'The current user has been successfully deleted.',
  })
  async deleteMe(@AuthUser() user: User) {
    return await this.userService.delete(user.id)
  }
}
