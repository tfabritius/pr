import { Injectable } from '@nestjs/common'
import { PortfolioSecurity, Prisma } from '@prisma/client'

import { SecurityKpis } from './security.kpis'
import { CurrenciesConversionService } from '../../currencies/currencies.conversion.service'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class SecuritiesKpisService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currenciesConversionService: CurrenciesConversionService,
  ) {}

  public async getKpis(
    security: PortfolioSecurity,
    { baseCurrencyCode }: { baseCurrencyCode: string },
  ): Promise<SecurityKpis> {
    const kpis = new SecurityKpis()

    kpis.shares = await this.getShares(security)
    kpis.quote = await this.getQuote(security)

    kpis.value = kpis.shares.times(kpis.quote)

    if (baseCurrencyCode) {
      kpis.quoteInBaseCurrency = await this.currenciesConversionService.convertCurrencyAmount(
        kpis.quote,
        security.currencyCode,
        baseCurrencyCode,
      )
      kpis.valueInBaseCurrency = kpis.shares.times(kpis.quoteInBaseCurrency)
    }

    return kpis
  }

  /**
   * Gets number of shares
   */
  private async getShares(
    security: PortfolioSecurity,
  ): Promise<Prisma.Decimal> {
    const {
      sum: { shares },
    } = await this.prisma.transaction.aggregate({
      sum: { shares: true },
      where: { securityId: security.id },
    })

    if (shares === null) return new Prisma.Decimal(0)
    return shares
  }

  /**
   * Gets quote of security
   */
  private async getQuote(security: PortfolioSecurity): Promise<Prisma.Decimal> {
    const price = await this.prisma.portfolioSecurityPrice.findFirst({
      where: { securityId: security.id },
      orderBy: { date: 'desc' },
      take: 1,
    })

    return price?.value ?? new Prisma.Decimal(0)
  }
}
