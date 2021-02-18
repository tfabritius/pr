import { Injectable } from '@nestjs/common'
import { Prisma, PortfolioSecurityPrice } from '@prisma/client'

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
  async upsert(
    securityId: number,
    dtos: SecurityPriceDto[],
  ): Promise<PortfolioSecurityPrice[]> {
    const ret: PortfolioSecurityPrice[] = []

    for (const { date, value } of dtos) {
      const price = await this.prisma.portfolioSecurityPrice.upsert({
        create: { date: date.toDate(), value, securityId },
        update: { date: date.toDate(), value },
        where: { securityId_date: { securityId, date: date.toDate() } },
      })

      ret.push(price)
    }

    return ret
  }

  /**
   * Gets prices of a security
   */
  async getAll(
    { securityId }: SecurityParams,
    query: PricesQuery,
  ): Promise<PortfolioSecurityPrice[]> {
    const dateFilter: Prisma.PortfolioSecurityPriceWhereInput[] = []

    if (query.startDate) {
      dateFilter.push({ date: { gte: query.startDate.toDate() } })
    }

    if (query.endDate) {
      dateFilter.push({ date: { lte: query.endDate.toDate() } })
    }

    return await this.prisma.portfolioSecurityPrice.findMany({
      where: { securityId, AND: dateFilter },
    })
  }
}
