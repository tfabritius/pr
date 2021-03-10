import { Injectable, NotFoundException } from '@nestjs/common'
import { Portfolio } from '@prisma/client'

import { User } from '../auth/users/user.entity'
import { CreateUpdatePortfolioDto } from './dto/CreateUpdatePortfolio.dto'
import { PortfolioParams } from './portfolio.params'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PortfoliosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates portfolio
   */
  async create(
    user: User,
    { name, note, baseCurrencyCode }: CreateUpdatePortfolioDto,
  ): Promise<Portfolio> {
    return await this.prisma.portfolio.create({
      data: { name, note, baseCurrencyCode, userId: user.id },
    })
  }

  /**
   * Gets all portfolios of an user
   */
  async getAllOfUser(user: User) {
    return await this.prisma.portfolio.findMany({
      where: { userId: user.id },
    })
  }

  /**
   * Gets portfolio identified by the parameters
   * or throws NotFoundException
   */
  async getOne(params: PortfolioParams): Promise<Portfolio> {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id: params.portfolioId },
    })

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found')
    }

    return portfolio
  }

  /**
   * Gets portfolio identified by the parameters and specified user
   * or throws NotFoundException
   */
  async getOneOfUser(user: User, params: PortfolioParams): Promise<Portfolio> {
    const portfolio = await this.prisma.portfolio.findFirst({
      where: { id: params.portfolioId, userId: user.id },
    })

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found')
    }

    return portfolio
  }

  /**
   * Updates portfolio identified by the parameters
   * or throws NotFoundException
   */
  async update(
    params: PortfolioParams,
    { name, note, baseCurrencyCode }: CreateUpdatePortfolioDto,
  ): Promise<Portfolio> {
    await this.getOne(params)
    return await this.prisma.portfolio.update({
      data: { name, note, baseCurrencyCode, updatedAt: new Date() },
      where: { id: params.portfolioId },
    })
  }

  /**
   * Deletes portfolio identified by parameters
   * or throws NotFoundException
   */
  async delete(params: PortfolioParams) {
    const portfolio = await this.getOne(params)

    await this.prisma
      .$executeRaw`DELETE FROM portfolios WHERE id=${params.portfolioId}`

    return portfolio
  }
}
