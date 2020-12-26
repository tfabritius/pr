import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import Big from 'big.js'
import { Repository } from 'typeorm'

import { Security } from './security.entity'
import { SecurityPrice } from './prices/price.entity'
import { SecurityKpis } from './security.kpis'
import { CurrenciesConversionService } from '../../currencies/currencies.conversion.service'

@Injectable()
export class SecuritiesKpisService {
  constructor(
    @InjectRepository(Security)
    private readonly securitiesRepository: Repository<Security>,

    @InjectRepository(SecurityPrice)
    private readonly securitiesPricesRepository: Repository<SecurityPrice>,

    private readonly currenciesConversionService: CurrenciesConversionService,
  ) {}

  public async getKpis(
    security: Security,
    { baseCurrencyCode }: { baseCurrencyCode: string },
  ): Promise<SecurityKpis> {
    const kpis = new SecurityKpis()

    kpis.shares = await this.getShares(security)
    kpis.quote = await this.getQuote(security)

    kpis.value = kpis.shares.times(kpis.quote)

    if (baseCurrencyCode) {
      kpis.quoteInBaseCurrency = await this.currenciesConversionService.convertCurrencyAmount(
        kpis.quote,
        security.currencyCode,
        baseCurrencyCode,
      )
      kpis.valueInBaseCurrency = kpis.shares.times(kpis.quoteInBaseCurrency)
    }

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

  /**
   * Gets quote of security
   */
  private async getQuote(security: Security): Promise<Big> {
    const price = await this.securitiesPricesRepository
      .createQueryBuilder('price')
      .where('security_id = :securityId', { securityId: security.id })
      .orderBy('date', 'DESC')
      .take(1)
      .getOne()

    return price?.value ?? Big(0)
  }
}
