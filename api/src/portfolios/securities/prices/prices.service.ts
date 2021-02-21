import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { zonedTimeToUtc } from 'date-fns-tz'

import { SecurityParams } from '../security.params'
import { SecurityPriceDto } from './prices.dto'
import { PricesQuery } from './prices.query'
import { PrismaService } from '../../../prisma.service'

@Injectable()
export class SecuritiesPricesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates or updates prices of security
   */
  async upsert(securityId: number, dtos: SecurityPriceDto[]) {
    const prices: { date: string; value: Prisma.Decimal }[] = dtos.map((p) => ({
      date: p.date.format('YYYY-MM-DD'),
      value: new Prisma.Decimal(p.value),
    }))

    await this.prisma.$executeRaw(
      'INSERT INTO portfolios_securities_prices (security_id, date, value) ' +
        'VALUES ' +
        prices
          .map((price) => `(${securityId}, '${price.date}', ${price.value})`)
          .join(',') +
        ' ON CONFLICT(security_id, date) DO UPDATE SET value=excluded.value',
    )

    return prices
  }

  /**
   * Gets prices of a security
   */
  async getAll({ securityId }: SecurityParams, query: PricesQuery) {
    const dateFilter: Prisma.PortfolioSecurityPriceWhereInput[] = []

    if (query.startDate) {
      const startDate = zonedTimeToUtc(query.startDate.toDate(), 'local')
      dateFilter.push({ date: { gte: startDate } })
    }

    if (query.endDate) {
      const endDate = zonedTimeToUtc(query.endDate.toDate(), 'local')
      dateFilter.push({ date: { lte: endDate } })
    }

    const prices = await this.prisma.portfolioSecurityPrice.findMany({
      where: { securityId, AND: dateFilter },
      select: { date: true, value: true },
    })
    return prices.map((p) => ({
      ...p,
      date: p.date.toISOString().substring(0, 10),
    }))
  }
}
