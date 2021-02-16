import { InputType, Field } from '@nestjs/graphql'
import { ApiProperty } from '@nestjs/swagger'
import { MinLength, MaxLength, Matches, IsNotEmpty } from 'class-validator'

@InputType()
export class RegisterUserDto {
  @ApiProperty()
  @Field()
  @IsNotEmpty({ message: 'Username is missing' })
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
  @Field()
  @IsNotEmpty({ message: 'Password is missing' })
  @MinLength(8, {
    message: 'Password is too short ($constraint1 characters required)',
  })
  @MaxLength(255, {
    message: 'Password is too long ($constraint1 characters maximum)',
  })
  readonly password: string
}

@InputType()
export class LoginUserDto {
  @ApiProperty()
  @Field()
  @IsNotEmpty()
  readonly username: string

  @ApiProperty()
  @Field()
  @IsNotEmpty()
  readonly password: string
}
