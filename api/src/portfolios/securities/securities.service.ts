import { Injectable, NotFoundException } from '@nestjs/common'
import { Portfolio, PortfolioSecurity } from '@prisma/client'

import { SecurityDto } from './securities.dto'
import { SecurityParams } from './security.params'
import { PortfolioParams } from '../portfolio.params'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class SecuritiesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates security in portfolio
   */
  async create(
    portfolio: Portfolio,
    dto: SecurityDto,
  ): Promise<PortfolioSecurity> {
    return await this.prisma.portfolioSecurity.create({
      data: { ...dto, portfolioId: portfolio.id },
    })
  }

  /**
   * Gets all securities in a portfolio
   */
  async getAll(params: PortfolioParams) {
    const securities = await this.prisma.portfolioSecurity.findMany({
      where: { portfolioId: params.portfolioId },
      include: {
        prices: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    })

    return securities.map((s) => {
      const { prices, ...pureS } = s
      return {
        ...pureS,
        latestPriceDate: prices[0]?.date.toISOString().substring(0, 10) || null,
      }
    })
  }

  /**
   * Gets security identified by parameters
   * or throws NotFoundException
   */
  async getOne(params: SecurityParams) {
    const security = await this.prisma.portfolioSecurity.findFirst({
      where: { id: params.securityId, portfolio: { id: params.portfolioId } },
      include: {
        prices: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    })

    if (!security) {
      throw new NotFoundException('Security not found')
    }

    const { prices, ...securityWithoutPrices } = security
    return {
      ...securityWithoutPrices,
      latestPriceDate: prices[0]?.date.toISOString().substring(0, 10) || null,
    }
  }

  /**
   * Gets security identified by parameters
   * or throws NotFoundException
   */
  async getOneOfUser(securityId: number, userId: number) {
    const security = await this.prisma.portfolioSecurity.findFirst({
      where: { id: securityId, portfolio: { userId } },
      include: {
        prices: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    })

    if (!security) {
      throw new NotFoundException('Security not found')
    }

    const { prices, ...securityWithoutPrices } = security
    return {
      ...securityWithoutPrices,
      latestPriceDate: prices[0]?.date.toISOString().substring(0, 10) || null,
    }
  }

  /**
   * Updates security identified by the parameters
   * or throws NotFoundException
   */
  async update(
    params: SecurityParams,
    dto: SecurityDto,
  ): Promise<PortfolioSecurity> {
    await this.getOne(params)

    return await this.prisma.portfolioSecurity.update({
      data: dto,
      where: { id: params.securityId },
    })
  }

  /**
   * Deletes security identified by parameters
   */
  async delete(params: SecurityParams): Promise<void> {
    const affected = await this.prisma
      .$executeRaw`DELETE FROM portfolios_securities WHERE id=${params.securityId} AND portfolio_id=${params.portfolioId}`

    if (affected == 0) {
      throw new NotFoundException('Security not found')
    }
  }
}
