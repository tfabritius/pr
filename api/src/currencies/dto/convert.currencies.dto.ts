import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { Transform, Type } from 'class-transformer'
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator'

import { parseDecimal } from '../../utils/decimal.parser'
import { IsValidDecimal } from '../../utils/decimal.validator'

export class ConvertCurrenciesDto {
  @IsString()
  @IsNotEmpty()
  readonly sourceCurrencyCode: string

  @IsString()
  @IsNotEmpty()
  readonly targetCurrencyCode: string

  @Transform(parseDecimal)
  @IsValidDecimal()
  @ApiProperty({ type: String, example: '1.0' })
  readonly sourceAmount: Prisma.Decimal

  @Type(() => Date)
  @IsOptional()
  @IsDate()
  @ApiPropertyOptional({ type: String, example: 'YYYY-MM-DD' })
  readonly date?: Date
}
