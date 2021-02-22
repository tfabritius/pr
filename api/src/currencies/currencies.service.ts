import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { Interval, Timeout } from '@nestjs/schedule'
import { Prisma } from '@prisma/client'
import axios from 'axios'
import { addDays, subDays } from 'date-fns'

import { ExchangeRateParams } from './exchangerate.params'
import { ExchangeRateQuery } from './exchangerate.query'
import { PrismaService } from '../prisma.service'
import { startOfDayInUtc } from '../utils/start.of.day.in.utc'

@Injectable()
export class CurrenciesService {
  private readonly logger = new Logger(CurrenciesService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gets all currencies with their exchange rates
   */
  async getAllCurrencies() {
    return await this.prisma.currency.findMany({
      include: {
        exchangeratesBase: {
          select: { baseCurrencyCode: true, quoteCurrencyCode: true },
        },
        exchangeratesQuote: {
          select: { baseCurrencyCode: true, quoteCurrencyCode: true },
        },
      },
    })
  }

  /**
   * Gets all exchange rates with latestPriceDate but without prices
   */
  async getAllExchangeRates() {
    const exchangerates = await this.prisma.exchangerate.findMany({
      include: {
        prices: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    })

    return exchangerates.map((er) => {
      const { prices, ...pureEr } = er
      return {
        ...pureEr,
        latestPriceDate: prices[0]?.date.toISOString().substring(0, 10) || null,
      }
    })
  }

  /**
   * Gets exchange rate identified by the parameters
   * or throws NotFoundException
   */
  async getOneExchangeRate(
    { baseCurrencyCode, quoteCurrencyCode }: ExchangeRateParams,
    query: ExchangeRateQuery,
  ) {
    const startDate = query.startDate
      ? query.startDate
      : startOfDayInUtc(subDays(new Date(), 30))

    const exchangerate = await this.prisma.exchangerate.findUnique({
      where: {
        baseCurrencyCode_quoteCurrencyCode: {
          baseCurrencyCode,
          quoteCurrencyCode,
        },
      },
      select: {
        baseCurrencyCode: true,
        quoteCurrencyCode: true,
        prices: {
          select: { date: true },
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    })

    if (!exchangerate) {
      throw new NotFoundException('Exchange rate not found')
    }

    const prices = await this.prisma.exchangeratePrice.findMany({
      where: {
        date: { gte: startDate },
        exchangerate: { baseCurrencyCode, quoteCurrencyCode },
      },
      select: { date: true, value: true },
      orderBy: { date: 'asc' },
    })

    return {
      ...exchangerate,
      prices: prices.map((p) => ({
        ...p,
        date: p.date.toISOString().substring(0, 10),
      })),
      latestPriceDate:
        exchangerate.prices[0]?.date.toISOString().substring(0, 10) ?? null,
    }
  }

  /**
   * Gets exchange rate price at certain date
   *
   * @throws NotFoundException
   */
  async getOneExchangeRatePrice({
    baseCurrencyCode,
    quoteCurrencyCode,
    date,
  }: ExchangeRateParams & { date: Date }): Promise<Prisma.Decimal> {
    const exchangerate = await this.prisma.exchangerate.findUnique({
      where: {
        baseCurrencyCode_quoteCurrencyCode: {
          baseCurrencyCode,
          quoteCurrencyCode,
        },
      },
      include: {
        prices: {
          where: { date: { lte: date } },
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    })

    if (!exchangerate) {
      throw new NotFoundException('Exchange rate not found')
    }

    return exchangerate.prices[0]?.value
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
        const latestPriceDate = new Date(exchangerate.latestPriceDate)
        params.from = addDays(latestPriceDate, 1).toISOString().substring(0, 10)
      }

      this.logger.debug(`GET ${url}, params: ${JSON.stringify(params)}`)
      const response = await axios.get(url, { params })

      if (response.data.length === 0) {
        this.logger.debug('Empty response, skipping update')
        continue
      }

      const newPrices: {
        exchangerateId: number
        date: Date
        value: string
      }[] = response.data.map((el) => ({
        exchangerateId: exchangerate.id,
        date: new Date(el.date),
        value: el.value,
      }))

      this.logger.debug(`Saving ${newPrices.length} new price(s)`)
      await this.prisma.exchangeratePrice.createMany({ data: newPrices })
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
