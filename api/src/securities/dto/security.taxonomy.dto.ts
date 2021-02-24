import { IsString, IsUUID } from 'class-validator'

export class SecurityTaxonomyDto {
  @IsUUID()
  taxonomyUuid: string

  @IsString()
  weight: string
}
