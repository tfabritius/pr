import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import Big from 'big.js'
import { Repository } from 'typeorm'

import { Security } from './security.entity'
import { SecurityKpis } from './security.kpis'

@Injectable()
export class SecuritiesKpisService {
  constructor(
    @InjectRepository(Security)
    private readonly securitiesRepository: Repository<Security>,
  ) {}

  public async getKpis(security: Security): Promise<SecurityKpis> {
    const kpis = new SecurityKpis()

    kpis.shares = await this.getShares(security)

    return kpis
  }

  /**
   * Gets number of shares
   */
  private async getShares(security: Security): Promise<Big> {
    const { shares } = await this.securitiesRepository
      .createQueryBuilder('security')
      .select('SUM(t.shares)', 'shares')
      .innerJoin('security.transactions', 't')
      .where({ id: security.id })
      .getRawOne()
    if (shares === null) return Big('0')
    return Big(shares)
  }
}
