import { IsOptional, IsString } from 'class-validator'

export class CreateUpdateSecurityDto {
  @IsOptional()
  @IsString()
  readonly name?: string

  @IsOptional()
  @IsString()
  readonly isin?: string

  @IsOptional()
  @IsString()
  readonly wkn?: string

  @IsOptional()
  @IsString()
  readonly securityType?: string

  @IsOptional()
  @IsString()
  readonly symbolXfra?: string

  @IsOptional()
  @IsString()
  readonly symbolXnas?: string

  @IsOptional()
  @IsString()
  readonly symbolXnys?: string
}
