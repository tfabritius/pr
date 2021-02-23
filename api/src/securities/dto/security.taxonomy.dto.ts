import { IsString } from 'class-validator'

export class SecurityTaxonomyDto {
  @IsString()
  taxonomyUuid: string

  @IsString()
  weight: string
}
