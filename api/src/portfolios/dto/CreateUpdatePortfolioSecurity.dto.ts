import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'

export class CreateUpdatePortfolioSecurityDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string

  @IsString()
  readonly currencyCode: string

  @IsOptional()
  @IsString()
  readonly isin?: string

  @IsOptional()
  @IsString()
  readonly wkn?: string

  @IsOptional()
  @IsString()
  readonly symbol?: string

  @IsBoolean()
  readonly active: boolean = true

  @IsOptional()
  @IsString()
  readonly note?: string

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly updatedAt?: Date = new Date()
}
