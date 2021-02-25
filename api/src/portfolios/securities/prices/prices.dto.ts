import { ApiProperty } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { IsDate } from 'class-validator'
import { Transform, Type } from 'class-transformer'

import { parseDecimal } from '../../../utils/decimal.parser'
import { IsValidDecimal } from '../../../utils/decimal.validator'

export class SecurityPriceDto {
  @ApiProperty({ type: String, example: 'YYYY-MM-DD' })
  @Type(() => Date)
  @IsDate()
  readonly date: Date

  @Transform(parseDecimal)
  @IsValidDecimal()
  @ApiProperty({ type: String, example: '1.0' })
  readonly value: Prisma.Decimal
}
