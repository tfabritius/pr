import { ApiProperty } from '@nestjs/swagger'
import { MinLength, MaxLength, Matches, IsNotEmpty } from 'class-validator'

export class RegisterUserDto {
  @ApiProperty()
  @MinLength(6, {
    message: 'Username is too short ($constraint1 characters required)',
  })
  @MaxLength(100, {
    message: 'Username is too long ($constraint1 characters maximum).',
  })
  @Matches(/^([a-zA-Z0-9._-])*$/, {
    message: 'Username contains invalid characters.',
  })
  readonly username: string

  @ApiProperty()
  @MinLength(8, {
    message: 'Password is too short ($constraint1 characters required)',
  })
  @MaxLength(255, {
    message: 'Password is too long ($constraint1 characters required)',
  })
  readonly password: string
}

export class LoginUserDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly username: string

  @ApiProperty()
  @IsNotEmpty()
  readonly password: string
}
