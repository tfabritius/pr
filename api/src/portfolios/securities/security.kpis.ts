import { ApiPropertyOptional } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { Transform } from 'class-transformer'

export class PortfolioSecurityKpis {
  @Transform(({ value }: { value: Prisma.Decimal }) => value.toString(), {
    toPlainOnly: true,
  })
  @ApiPropertyOptional({ type: String })
  shares?: Prisma.Decimal

  @Transform(({ value }: { value: Prisma.Decimal }) => value.toString(), {
    toPlainOnly: true,
  })
  @ApiPropertyOptional({ type: String })
  quote?: Prisma.Decimal

  @Transform(({ value }: { value: Prisma.Decimal }) => value.toString(), {
    toPlainOnly: true,
  })
  @ApiPropertyOptional({ type: String })
  quoteInBaseCurrency?: Prisma.Decimal

  @Transform(({ value }: { value: Prisma.Decimal }) => value.toString(), {
    toPlainOnly: true,
  })
  @ApiPropertyOptional({ type: String })
  value?: Prisma.Decimal

  @Transform(({ value }: { value: Prisma.Decimal }) => value.toString(), {
    toPlainOnly: true,
  })
  @ApiPropertyOptional({ type: String })
  valueInBaseCurrency?: Prisma.Decimal
}
