import { CreateUpdateSecurityMarketPriceDto } from './create.update.security.market.price.dto'

export class CreateUpdateSecurityMarketDto {
  currencyCode: string
  symbol: string
  updatePrices: boolean
  prices?: CreateUpdateSecurityMarketPriceDto[]
}
