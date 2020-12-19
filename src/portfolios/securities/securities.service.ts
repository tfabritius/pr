import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as dayjs from 'dayjs'

import { Portfolio } from '../portfolio.entity'
import { SecurityDto } from './securities.dto'
import { Security } from './security.entity'
import { SecurityPrice } from './price.entity'
import { SecurityParams } from './security.params'
import { PortfolioParams } from '../portfolio.params'

@Injectable()
export class SecuritiesService {
  constructor(
    @InjectRepository(Security)
    private readonly securitiesRepository: Repository<Security>,

    @InjectRepository(SecurityPrice)
    private readonly securitiesPricesRepository: Repository<SecurityPrice>,
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
    const { entities, raw } = await this.securitiesRepository
      .createQueryBuilder('security')
      .where('security.portfolio_id = :portfolioId', {
        portfolioId: params.portfolioId,
      })
      .addSelect((qb) =>
        qb
          .select('MAX(p.date) as latest_price_date')
          .from(SecurityPrice, 'p')
          .where('p.security_id = security.id'),
      )
      .getRawAndEntities()

    raw.forEach((item, index) => {
      entities[index].latestPriceDate = item.latest_price_date
        ? dayjs(item.latest_price_date).format('YYYY-MM-DD')
        : null
    })

    return entities
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

    const latestPrice = await this.securitiesPricesRepository
      .createQueryBuilder('p')
      .select('MAX(p.date) as date')
      .where('p.security_id = :id', { id: params.securityId })
      .getRawOne()

    security.latestPriceDate = latestPrice.date
      ? dayjs(latestPrice.date).format('YYYY-MM-DD')
      : null

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
