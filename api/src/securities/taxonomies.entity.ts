import { ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Taxonomy {
  uuid: string
  parentUuid?: string
  rootUuid: string
  name: string
  code?: string
}
