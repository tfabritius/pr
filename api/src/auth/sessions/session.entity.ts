import { ObjectType, Field } from '@nestjs/graphql'
import { ApiHideProperty } from '@nestjs/swagger'

import { User } from '../users/user.entity'
import { Exclude } from 'class-transformer'

@ObjectType()
export class Session {
  @Field()
  token: string

  createdAt: Date

  lastActivityAt: Date

  @ApiHideProperty()
  @Exclude()
  user: User
}
