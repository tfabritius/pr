import { InputType } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'

@InputType()
export class LoginUserDto {
  @IsNotEmpty()
  readonly username: string

  @IsNotEmpty()
  readonly password: string
}
