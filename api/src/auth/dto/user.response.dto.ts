import { ApiHideProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

export class UserResponseDto {
  username: string
  createdAt: Date
  lastSeenAt: Date

  @Exclude()
  @ApiHideProperty()
  id: number

  @Exclude()
  @ApiHideProperty()
  password: string

  constructor(data: Partial<UserResponseDto> = {}) {
    Object.assign(this, data)
  }
}
