import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PortfolioSecurity, Prisma } from '@prisma/client'

import { CreateUpdatePortfolioSecurityDto } from '../dto/CreateUpdatePortfolioSecurity.dto'
import { PortfolioSecurityParams } from './security.params'
import { PortfolioParams } from '../portfolio.params'
import { PrismaService } from '../../prisma.service'
import { TransactionsService } from '../transactions/transactions.service'

@Injectable()
export class PortfolioSecuritiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactions: TransactionsService,
  ) {}

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
      securityUuid,
      properties,
      events,
      updatedAt,
    }: CreateUpdatePortfolioSecurityDto,
  ) {
    try {
      return await this.prisma.portfolioSecurity.upsert({
        create: {
          uuid,
          name,
          isin,
          wkn,
          symbol,
          active,
          note,
          securityUuid,
          properties,
          events,
          updatedAt,
          currencyCode,
          portfolioId,
        },
        update: {
          name,
          isin,
          wkn,
          symbol,
          active,
          note,
          securityUuid,
          properties,
          events,
          updatedAt,
          currencyCode,
        },
        where: { portfolioId_uuid: { portfolioId, uuid } },
      })
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2003'
      ) {
        throw new BadRequestException('securityUuid not found')
      } else {
        throw e
      }
    }
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
  async delete(params: PortfolioSecurityParams) {
    const security = await this.getOne(params)

    // Delete transactions of security
    const transactions = await this.transactions.getAllOfSecurity(params)
    for (const { portfolioId, uuid } of transactions) {
      await this.transactions.delete({
        portfolioId: portfolioId,
        transactionUuid: uuid,
      })
    }

    await this.prisma
      .$executeRaw`DELETE FROM portfolios_securities WHERE uuid=${params.securityUuid} AND portfolio_id=${params.portfolioId}`

    return security
  }
}
