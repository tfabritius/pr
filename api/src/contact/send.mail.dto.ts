import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class SendMailDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string

  @IsEmail()
  readonly email: string

  @IsString()
  @IsNotEmpty()
  readonly subject: string

  @IsString()
  @IsNotEmpty()
  readonly message: string
}
