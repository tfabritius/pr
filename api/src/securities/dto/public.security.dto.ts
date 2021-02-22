import { PublicSecurityMarket } from './public.security.market.dto'

export class PublicSecurity {
  uuid: string
  name: string

  isin: string
  wkn: string

  securityType: string

  symbolXfra: string

  symbolXnas: string

  symbolXnys: string
  markets: PublicSecurityMarket[]
}
