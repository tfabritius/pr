export class PortfolioSecurityResponseDto {
  id: number
  name: string
  uuid: string
  currencyCode: string
  isin: string
  wkn: string
  symbol: string
  active: boolean
  note: string
  latestPriceDate?: string
}
