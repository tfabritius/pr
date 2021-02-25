import { ApiProperty } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { Transform } from 'class-transformer'
import { IsUUID } from 'class-validator'

import { parseDecimal } from '../../utils/decimal.parser'
import { IsValidDecimal } from '../../utils/decimal.validator'

export class SecurityTaxonomyDto {
  @IsUUID()
  taxonomyUuid: string

  @Transform(parseDecimal)
  @IsValidDecimal()
  @ApiProperty({ type: String, example: '1.0' })
  weight: Prisma.Decimal
}
