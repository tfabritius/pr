import { ApiPropertyOptional } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { Transform } from 'class-transformer'

export class AccountKpis {
  @Transform(({ value }: { value: Prisma.Decimal }) => value.toString(), {
    toPlainOnly: true,
  })
  @ApiPropertyOptional({ type: String })
  balance?: Prisma.Decimal

  @Transform(({ value }: { value: Prisma.Decimal }) => value.toString(), {
    toPlainOnly: true,
  })
  @ApiPropertyOptional({ type: String })
  valueInBaseCurrency?: Prisma.Decimal
}
