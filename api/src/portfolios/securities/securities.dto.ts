import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateUpdateSecurityDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string

  @IsString()
  readonly currencyCode: string

  @IsString()
  readonly isin: string

  @IsString()
  readonly wkn: string

  @IsString()
  readonly symbol: string

  @IsBoolean()
  readonly active: boolean = true

  @IsOptional()
  @IsString()
  readonly note?: string
}
