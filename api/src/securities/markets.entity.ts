import { ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Market {
  code: string
  name: string
}
