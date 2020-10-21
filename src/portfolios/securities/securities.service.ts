import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Portfolio } from '../portfolio.entity'
import { SecurityDto } from './securities.dto'
import { Security } from './security.entity'
import { SecurityParams } from './security.params'
import { PortfolioParams } from '../portfolio.params'

@Injectable()
export class SecuritiesService {
  constructor(
    @InjectRepository(Security)
    private readonly securitiesRepository: Repository<Security>,
  ) {}

  /**
   * Creates security in portfolio
   */
  async create(portfolio: Portfolio, dto: SecurityDto): Promise<Security> {
    const security = new Security()
    Object.assign(security, dto)
    security.portfolio = portfolio
    return await this.securitiesRepository.save(security)
  }

  /**
   * Gets all securities in a portfolio
   */
  async getAll(params: PortfolioParams): Promise<Security[]> {
    return this.securitiesRepository.find({
      relations: ['portfolio'],
      where: {
        portfolio: { id: params.portfolioId },
      },
    })
  }

  /**
   * Gets security identified by parameters
   * or throws NotFoundException
   */
  async getOne(params: SecurityParams): Promise<Security> {
    const security = await this.securitiesRepository.findOne({
      where: { id: params.securityId, portfolio: { id: params.portfolioId } },
    })

    if (!security) {
      throw new NotFoundException('Security not found')
    }

    return security
  }

  /**
   * Updates security identified by the parameters
   * or throws NotFoundException
   */
  async update(params: SecurityParams, dto: SecurityDto): Promise<Security> {
    const security = await this.getOne(params)
    Object.assign(security, dto)
    return await this.securitiesRepository.save(security)
  }

  /**
   * Deletes security identified by parameters
   */
  async delete(params: SecurityParams): Promise<void> {
    const { affected } = await this.securitiesRepository.delete({
      id: params.securityId,
      portfolio: { id: params.portfolioId },
    })

    if (affected == 0) {
      throw new NotFoundException('Security not found')
    }
  }
}
