import { Injectable, NotFoundException } from '@nestjs/common'
import { PortfolioSecurity } from '@prisma/client'

import { CreateUpdatePortfolioSecurityDto } from '../dto/CreateUpdatePortfolioSecurity.dto'
import { PortfolioSecurityParams } from './security.params'
import { PortfolioParams } from '../portfolio.params'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class PortfolioSecuritiesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates or updates security
   */
  async upsert(
    { portfolioId, securityUuid: uuid }: PortfolioSecurityParams,
    {
      name,
      currencyCode,
      isin,
      wkn,
      symbol,
      active,
      note,
    }: CreateUpdatePortfolioSecurityDto,
  ) {
    return await this.prisma.portfolioSecurity.upsert({
      create: {
        uuid,
        name,
        isin,
        wkn,
        symbol,
        active,
        note,
        currency: { connect: { code: currencyCode } },
        portfolio: { connect: { id: portfolioId } },
      },
      update: {
        name,
        isin,
        wkn,
        symbol,
        active,
        note,
        currency: { connect: { code: currencyCode } },
      },
      where: { portfolioId_uuid: { portfolioId, uuid } },
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
  async getOne({ portfolioId, securityUuid: uuid }: PortfolioSecurityParams) {
    const security = await this.prisma.portfolioSecurity.findFirst({
      where: {
        uuid,
        portfolio: { id: portfolioId },
      },
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
  async getOneOfUser(
    portfolioId: number,
    securityUuid: string,
    userId: number,
  ) {
    const security = await this.prisma.portfolioSecurity.findFirst({
      where: { portfolioId, uuid: securityUuid, portfolio: { userId } },
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
    params: PortfolioSecurityParams,
    dto: CreateUpdatePortfolioSecurityDto,
  ): Promise<PortfolioSecurity> {
    await this.getOne(params)

    return await this.prisma.portfolioSecurity.update({
      data: dto,
      where: {
        portfolioId_uuid: {
          portfolioId: params.portfolioId,
          uuid: params.securityUuid,
        },
      },
    })
  }

  /**
   * Deletes security identified by parameters
   */
  async delete(params: PortfolioSecurityParams): Promise<void> {
    const affected = await this.prisma
      .$executeRaw`DELETE FROM portfolios_securities WHERE uuid=${params.securityUuid} AND portfolio_id=${params.portfolioId}`

    if (affected == 0) {
      throw new NotFoundException('Security not found')
    }
  }
}
