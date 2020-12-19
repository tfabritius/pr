import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import Big from 'big.js'

import { Security } from '../security.entity'
import { SecurityPrice } from './price.entity'
import { SecurityParams } from '../security.params'
import { SecurityPriceDto } from './prices.dto'

@Injectable()
export class SecuritiesPricesService {
  constructor(
    @InjectRepository(SecurityPrice)
    private readonly securitiesPricesRepository: Repository<SecurityPrice>,
  ) {}

  /**
   * Creates or updates prices of security
   */
  async upsert(
    security: Security,
    dtos: SecurityPriceDto[],
  ): Promise<SecurityPrice[]> {
    const prices: SecurityPrice[] = dtos.map((el) => {
      const p = new SecurityPrice()
      p.securityId = security.id
      p.date = el.date.format('YYYY-MM-DD')
      p.value = Big(el.value)
      return p
    })

    return await this.securitiesPricesRepository.save(prices)
  }

  /**
   * Gets prices of a security
   */
  async getAll(params: SecurityParams): Promise<SecurityPrice[]> {
    const prices = await this.securitiesPricesRepository.find({
      where: { securityId: params.securityId },
    })

    return prices
  }
}
