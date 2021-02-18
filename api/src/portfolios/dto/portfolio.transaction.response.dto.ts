import { Prisma } from '@prisma/client'

export class PortfolioTransactionResponseDto {
  id: number
  accountId: number
  type: string
  datetime: Date
  partnerTransaction?: PortfolioTransactionResponseDto
  partnerTransactionId?: number
  units: PortfolioTransactionUnitResponseDto[]
  shares: Prisma.Decimal
  securityId: number
  note: string
}

class PortfolioTransactionUnitResponseDto {
  id: number
  type: string
  amount: Prisma.Decimal
  currencyCode: string
  originalAmount?: Prisma.Decimal
  originalCurrencyCode?: string
  exchangerate?: Prisma.Decimal
}
