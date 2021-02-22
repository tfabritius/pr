import {
  IsDate,
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class ConvertCurrenciesDto {
  @IsString()
  @IsNotEmpty()
  readonly sourceCurrencyCode: string

  @IsString()
  @IsNotEmpty()
  readonly targetCurrencyCode: string

  @IsDecimal()
  readonly sourceAmount: string

  @IsOptional()
  @ApiPropertyOptional({ type: String, example: 'YYYY-MM-DD' })
  @Type(() => Date)
  @IsDate()
  readonly date?: Date
}
