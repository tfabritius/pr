import { ObjectType, Field } from '@nestjs/graphql'
import { ApiHideProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

import { Session } from '../sessions/session.entity'
import { Portfolio } from '../../portfolios/portfolio.entity'

@ObjectType()
export class User {
  @ApiHideProperty()
  @Exclude()
  id: number

  @Field()
  username: string

  @ApiHideProperty()
  @Exclude()
  password: string

  createdAt: Date

  lastSeenAt: string

  @ApiHideProperty()
  sessions: Session[]

  @ApiHideProperty()
  portfolios: Portfolio[]
}
