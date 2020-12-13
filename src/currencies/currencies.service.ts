import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Interval, Timeout } from '@nestjs/schedule'
import * as dayjs from 'dayjs'
import { Repository } from 'typeorm'
import axios from 'axios'

import { Currency } from './currency.entity'
import { ExchangeRate } from './exchangerate.entity'
import { ExchangeRateParams } from './exchangerate.params'
import { ExchangeRateQuery } from './exchangerate.query'
import { ExchangeRatePrice } from './price.entity'

@Injectable()
export class CurrenciesService {
  private readonly logger = new Logger(CurrenciesService.name)

  constructor(
    @InjectRepository(Currency)
    private readonly currenciesRepository: Repository<Currency>,

    @InjectRepository(ExchangeRate)
    private readonly exchangeRatesRepository: Repository<ExchangeRate>,

    @InjectRepository(ExchangeRatePrice)
    private readonly exchangeRatePricesRepository: Repository<ExchangeRatePrice>,
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
   * Gets all exchange rates with latestPriceDate but without prices
   */
  async getAllExchangeRates() {
    const { entities, raw } = await this.exchangeRatesRepository
      .createQueryBuilder('exchangerate')
      .addSelect((qb) =>
        qb
          .select('MAX(p.date) as latest_price_date')
          .from(ExchangeRatePrice, 'p')
          .where('p.exchangerate_id = exchangerate.id'),
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
   * Gets exchange rate identified by the parameters
   * or throws NotFoundException
   */
  async getOneExchangeRate(
    params: ExchangeRateParams,
    query: ExchangeRateQuery,
  ) {
    const startDate =
      query.startDate || dayjs().startOf('day').subtract(30, 'day')

    const { entities, raw } = await this.exchangeRatesRepository
      .createQueryBuilder('exchangerate')
      .where(params)
      .leftJoinAndSelect(
        'exchangerate.prices',
        'prices',
        'prices.date >= :startDate',
        { startDate: startDate.format('YYYY-MM-DD') },
      )
      .addSelect((qb) =>
        qb
          .select('MAX(p.date) as latest_price_date')
          .from(ExchangeRatePrice, 'p')
          .where('p.exchangerate_id = exchangerate.id'),
      )
      .getRawAndEntities()

    const exchangerate = entities[0]

    if (!exchangerate) {
      throw new NotFoundException('Exchange rate not found')
    }

    exchangerate.latestPriceDate = raw[0].latest_price_date
      ? dayjs(raw[0].latest_price_date).format('YYYY-MM-DD')
      : null

    return exchangerate
  }

  /**
   * Updates prices of all exchange rates
   */
  async updateExchangeRates(): Promise<void> {
    this.logger.log('Updating exchange rates')

    const exchangeRates = await this.getAllExchangeRates()

    const today: string = new Date().toISOString().substring(0, 10)

    for (const exchangerate of exchangeRates) {
      if (
        exchangerate.latestPriceDate &&
        exchangerate.latestPriceDate === today
      ) {
        this.logger.debug(
          'Skipping exchange rate ' + JSON.stringify(exchangerate),
        )
        continue
      }

      const url =
        `https://www.portfolio-report.net/api/exchangeRates` +
        `/${exchangerate.baseCurrencyCode}` +
        `/${exchangerate.quoteCurrencyCode}` +
        `/prices`

      const params: any = {}

      if (exchangerate.latestPriceDate) {
        const latestPriceDate = dayjs(exchangerate.latestPriceDate)
        params.from = latestPriceDate.add(1, 'day').format('YYYY-MM-DD')
      }

      this.logger.debug(`GET ${url}, params: ${JSON.stringify(params)}`)
      const response = await axios.get(url, { params })

      if (response.data.length === 0) {
        this.logger.debug('Empty response, skipping update')
        continue
      }

      const newPrices: ExchangeRatePrice[] = response.data.map((el) => {
        const p = new ExchangeRatePrice()
        p.exchangerate = exchangerate
        p.date = el.date
        p.value = el.value
        return p
      })

      this.logger.debug(`Saving ${newPrices.length} new price(s)`)
      await this.exchangeRatePricesRepository.save(newPrices)
    }

    this.logger.log('Updating exchange rates finished.')
  }

  @Timeout(30 * 1000)
  private async runAfterStart() {
    await this.updateExchangeRates()
  }

  @Interval(2 * 60 * 60 * 1000)
  private async runEvery2Hours() {
    await this.updateExchangeRates()
  }
}
