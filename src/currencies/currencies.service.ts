import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as dayjs from 'dayjs'
import { Repository } from 'typeorm'

import { Currency } from './currency.entity'
import { ExchangeRate } from './exchangerate.entity'
import { ExchangeRateParams } from './exchangerate.params'
import { ExchangeRateQuery } from './exchangerate.query'

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(Currency)
    private readonly currenciesRepository: Repository<Currency>,

    @InjectRepository(ExchangeRate)
    private readonly exchangeRatesRepository: Repository<ExchangeRate>,
  ) {}

  /**
   * Gets all currencies with their exchange rates
   */
  async getAllCurrencies() {
    return this.currenciesRepository.find({
      relations: ['exchangeRatesBase', 'exchangeRatesQuote'],
    })
  }

  /**
   * Gets exchange rate identified by the parameters
   * or throws NotFoundException
   */
  async getOneExchangeRate(
    params: ExchangeRateParams,
    query: ExchangeRateQuery,
  ) {
    const startDate =
      query.startDate || dayjs().startOf('day').subtract(30, 'day')

    const exchangeRate = await this.exchangeRatesRepository
      .createQueryBuilder('exchangerate')
      .where(params)
      .leftJoinAndSelect(
        'exchangerate.prices',
        'prices',
        'prices.date >= :startDate',
        { startDate: startDate.format('YYYY-MM-DD') },
      )
      .getOne()

    if (!exchangeRate) {
      throw new NotFoundException('Exchange rate not found')
    }

    return exchangeRate
  }
}
