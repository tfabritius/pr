import { ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Security {
  uuid: string
  name?: string
  isin?: string
  wkn?: string
  symbolXfra?: string
  symbolXnas?: string
  symbolXnys?: string
  securityType?: string
}
