import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { Interval, Timeout } from '@nestjs/schedule'
import { ExchangeratePrice, Prisma } from '@prisma/client'
import axios from 'axios'
import { addDays, subDays } from 'date-fns'
import * as xmljs from 'xml-js'

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

    for (const {
      id,
      baseCurrencyCode,
      quoteCurrencyCode,
      latestPriceDate,
    } of exchangeRates) {
      if (latestPriceDate && latestPriceDate === today) {
        this.logger.debug(
          `Skipping exchange rate ${baseCurrencyCode}/${quoteCurrencyCode}`,
        )
        continue
      }

      let from: Date
      if (latestPriceDate) {
        from = addDays(new Date(latestPriceDate), 1)
      }

      let newPrices: ExchangeratePrice[] = []

      if (baseCurrencyCode === 'EUR') {
        this.logger.debug(
          `Retrieving ${baseCurrencyCode}/${quoteCurrencyCode} from ECB`,
        )

        const prices = await this.getExchangeratePricesEcb(
          baseCurrencyCode,
          quoteCurrencyCode,
          from,
        )

        newPrices = prices.map((el) => ({
          ...el,
          exchangerateId: id,
        }))
      } else {
        this.logger.debug(
          `No source available for ${baseCurrencyCode}/${quoteCurrencyCode}`,
        )
      }

      if (newPrices.length > 0) {
        this.logger.debug(`Adding ${newPrices.length} new price(s)`)
        await this.prisma.exchangeratePrice.createMany({ data: newPrices })
      }
    }

    this.logger.log('Updating exchange rates finished.')
  }

  /**
   * Retrieves prices of EUR exchange rates from ECB
   */
  async getExchangeratePricesEcb(
    baseCurrencyCode: 'EUR',
    quoteCurrencyCode: string,
    from?: Date,
  ): Promise<Pick<ExchangeratePrice, 'date' | 'value'>[]> {
    const url = `https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/${quoteCurrencyCode.toLowerCase()}.xml`

    const response = await axios.get<string>(url)
    const parsedXml: xmljs.ElementCompact = xmljs.xml2js(response.data, {
      compact: true,
    })

    const prices: Pick<ExchangeratePrice, 'date' | 'value'>[] = []

    for (const el of parsedXml.CompactData?.DataSet?.Series?.Obs) {
      const date = new Date(el._attributes.TIME_PERIOD)
      const value = new Prisma.Decimal(el._attributes.OBS_VALUE)

      if (!from || date >= from) {
        prices.push({
          date,
          value,
        })
      }
    }

    return prices
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
