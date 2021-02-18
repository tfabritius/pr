import { Prisma } from '@prisma/client'

export class ExchangerateWithPricesResponseDto {
  baseCurrencyCode: string
  quoteCurrencyCode: string

  prices: ExchangeratePriceResponseDto[]

  latestPriceDate: Date
}

export class ExchangeratePriceResponseDto {
  date: Date
  value: Prisma.Decimal
}
