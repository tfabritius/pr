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
    const ret: { date: string; value: Prisma.Decimal }[] = []

    for (const { date: dayjsDate, value } of dtos) {
      const date = zonedTimeToUtc(dayjsDate.toDate(), 'local')
      const price = await this.prisma.portfolioSecurityPrice.upsert({
        create: {
          date,
          value,
          securityId,
        },
        update: { date, value },
        where: { securityId_date: { securityId, date } },
        select: { date: true, value: true },
      })

      ret.push({
        ...price,
        date: price.date.toISOString().substring(0, 10),
      })
    }

    return ret
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
