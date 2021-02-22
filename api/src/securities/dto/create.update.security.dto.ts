import { IsNotEmpty, IsString } from 'class-validator'

export class CreateUpdateSecurityDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string

  @IsString()
  readonly isin: string

  @IsString()
  readonly wkn: string

  @IsString()
  readonly securityType: string

  @IsString()
  readonly symbolXfra: string

  @IsString()
  readonly symbolXnas: string

  @IsString()
  readonly symbolXnys: string
}
