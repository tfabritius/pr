import { ObjectType, Field } from '@nestjs/graphql'
import { ApiHideProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

@ObjectType()
export class User {
  @ApiHideProperty()
  @Exclude()
  id: number

  @Field()
  username: string

  isAdmin: boolean

  createdAt: Date

  lastSeenAt: string
}
