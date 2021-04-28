import { Injectable } from '@nestjs/common'
import { Prisma, TransactionType } from '@prisma/client'

import { CurrenciesConversionService } from '../../currencies/currencies.conversion.service'
import { PortfolioSecurity } from './security.entity'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class SecuritiesKpisService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currenciesConversionService: CurrenciesConversionService,
  ) {}

  /**
   * Gets number of shares
   */
  public async getShares(security: PortfolioSecurity): Promise<Prisma.Decimal> {
    const {
      sum: { shares },
    } = await this.prisma.transaction.aggregate({
      sum: { shares: true },
      where: {
        portfolioId: security.portfolioId,
        portfolioSecurityUuid: security.uuid,
        type: {
          in: [
            TransactionType.SecuritiesOrder,
            TransactionType.SecuritiesTransfer,
          ],
        },
      },
    })

    if (shares === null) return new Prisma.Decimal(0)
    return shares
  }

  /**
   * Gets quote of security
   */
  public async getQuote(
    security: PortfolioSecurity,
    { currencyCode }: { currencyCode: string },
  ): Promise<Prisma.Decimal> {
    const price = await this.prisma.portfolioSecurityPrice.findFirst({
      where: {
        portfolioId: security.portfolioId,
        portfolioSecurityUuid: security.uuid,
      },
      orderBy: { date: 'desc' },
      take: 1,
    })

    const quote = price?.value ?? new Prisma.Decimal(0)

    if (currencyCode) {
      return await this.currenciesConversionService.convertCurrencyAmount(
        quote,
        security.currencyCode,
        currencyCode,
      )
    } else {
      return quote
    }
  }
}
