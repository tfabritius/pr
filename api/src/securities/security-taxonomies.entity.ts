import { ObjectType } from '@nestjs/graphql'

@ObjectType()
export class SecurityTaxonomy {
  securityUuid: string
  taxonomyUuid: string
  weight: string
}
