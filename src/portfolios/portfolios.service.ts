import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { User } from '../auth/users/user.entity'
import { Portfolio } from './portfolio.entity'
import { PortfolioDto } from './portfolios.dto'
import { PortfolioParams } from './portfolio.params'

@Injectable()
export class PortfoliosService {
  constructor(
    @InjectRepository(Portfolio)
    private readonly portfoliosRepository: Repository<Portfolio>,
  ) {}

  /**
   * Creates portfolio
   */
  async create(user: User, dto: PortfolioDto): Promise<Portfolio> {
    const portfolio = new Portfolio()
    Object.assign(portfolio, dto)
    portfolio.user = user
    return await this.portfoliosRepository.save(portfolio)
  }

  /**
   * Gets all portfolios of an user
   */
  async getAllOfUser(user: User) {
    return this.portfoliosRepository.find({
      where: { user: { id: user.id } },
    })
  }

  /**
   * Gets portfolio identified by the parameters
   * or throws NotFoundException
   */
  async getOne(params: PortfolioParams): Promise<Portfolio> {
    const portfolio = await this.portfoliosRepository.findOne(
      params.portfolioId,
    )

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
    const portfolio = await this.portfoliosRepository.findOne({
      where: { id: params.portfolioId, user: { id: user.id } },
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
  async update(params: PortfolioParams, dto: PortfolioDto): Promise<Portfolio> {
    const portfolio = await this.getOne(params)
    Object.assign(portfolio, dto)
    return await this.portfoliosRepository.save(portfolio)
  }

  /**
   * Deletes portfolio identified by parameters
   * or throws NotFoundException
   */
  async delete(params: PortfolioParams): Promise<void> {
    const { affected } = await this.portfoliosRepository.delete(
      params.portfolioId,
    )
    if (affected == 0) {
      throw new NotFoundException('Portfolio not found')
    }
  }
}
