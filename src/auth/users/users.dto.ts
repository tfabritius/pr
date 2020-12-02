import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class UpdatePasswordDto {
  @ApiProperty()
  @IsString()
  readonly oldPassword: string

  @ApiProperty()
  @MinLength(8, {
    message: 'Password is too short ($constraint1 characters required)',
  })
  @MaxLength(255, {
    message: 'Password is too long ($constraint1 characters required)',
  })
  readonly newPassword: string
}
