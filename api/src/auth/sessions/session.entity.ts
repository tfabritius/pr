import { ObjectType, Field } from '@nestjs/graphql'

@ObjectType()
export class Session {
  @Field()
  token: string

  createdAt: Date

  lastActivityAt: Date
}
