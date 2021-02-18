import { Prisma } from '@prisma/client'

export class PortfolioSecurityPriceResponseDto {
  date: Date
  value: Prisma.Decimal
}
