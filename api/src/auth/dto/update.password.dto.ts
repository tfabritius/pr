import { IsString, MaxLength, MinLength } from 'class-validator'

export class UpdatePasswordDto {
  @IsString()
  readonly oldPassword: string

  @MinLength(8, {
    message: 'Password is too short ($constraint1 characters required)',
  })
  @MaxLength(255, {
    message: 'Password is too long ($constraint1 characters required)',
  })
  readonly newPassword: string
}
