import { ApiHideProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

export class SessionResponseDto {
  token: string
  createdAt: Date
  lastActivityAt: Date

  @Exclude()
  @ApiHideProperty()
  userId: number

  constructor(data: Partial<SessionResponseDto> = {}) {
    Object.assign(this, data)
  }
}
