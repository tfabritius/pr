import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Interval, Timeout } from '@nestjs/schedule'
import Big from 'big.js'
import * as dayjs from 'dayjs'
import { LessThanOrEqual, Repository } from 'typeorm'
import axios from 'axios'
import { startOfDay, subDays } from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'

import { Currency } from './currency.entity'
import { ExchangeRate } from './exchangerate.entity'
import { ExchangeRateParams } from './exchangerate.params'
import { ExchangeRateQuery } from './exchangerate.query'
import { ExchangeRatePrice } from './price.entity'
import { PrismaService } from '../prisma.service'

@Injectable()
export class CurrenciesService {
  private readonly logger = new Logger(CurrenciesService.name)

  constructor(
    private readonly prisma: PrismaService,

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
    return await this.prisma.currency.findMany({
      include: { exchangeratesBase: true, exchangeratesQuote: true },
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
    const today = zonedTimeToUtc(startOfDay(new Date()), 'local')
    const startDate = query.startDate
      ? query.startDate.toDate()
      : subDays(today, 30)

    const exchangerate = await this.prisma.exchangerate.findUnique({
      where: { baseCurrencyCode_quoteCurrencyCode: params },
      include: {
        prices: {
          where: { date: { gte: startDate } },
          select: { date: true, value: true },
          orderBy: { date: 'asc' },
        },
      },
    })

    if (!exchangerate) {
      throw new NotFoundException('Exchange rate not found')
    }

    const {
      max: { date: latestPriceDate },
    } = await this.prisma.exchangeratePrice.aggregate({
      where: { exchangerateId: exchangerate.id },
      max: { date: true },
    })

    return { ...exchangerate, latestPriceDate }
  }

  /**
   * Gets exchange rate price at certain date
   *
   * @throws NotFoundException
   */
  async getOneExchangeRatePrice(
    options: ExchangeRateParams & { date: dayjs.Dayjs },
  ): Promise<Big> {
    const date = options.date

    const exchangerate = await this.exchangeRatesRepository.findOne({
      baseCurrencyCode: options.baseCurrencyCode,
      quoteCurrencyCode: options.quoteCurrencyCode,
    })

    if (!exchangerate) {
      throw new NotFoundException('Exchange rate not found')
    }

    const price = await this.exchangeRatePricesRepository
      .createQueryBuilder('prices')
      .where({
        exchangerate,
        date: LessThanOrEqual(date.format('YYYY-MM-DD')),
      })
      .orderBy('prices.date', 'DESC')
      .take(1)
      .getOne()

    return Big(price.value)
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

  @Timeout(5 * 60 * 1000)
  private async runAfterStart() {
    await this.updateExchangeRates()
  }

  @Interval(2 * 60 * 60 * 1000)
  private async runEvery2Hours() {
    await this.updateExchangeRates()
  }
}
