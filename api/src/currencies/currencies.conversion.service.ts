import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { findAllPairsShortestPath } from '../utils/floyd.warshall'
import { startOfDayInUtc } from '../utils/start.of.day.in.utc'
import { CurrenciesService } from './currencies.service'

export class CurrencyConversionError extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, CurrencyConversionError.prototype)

    this.name = 'CurrencyConversionError'
  }
}

@Injectable()
export class CurrenciesConversionService implements OnModuleInit {
  private readonly logger = new Logger(CurrenciesConversionService.name)

  constructor(private readonly currenciesService: CurrenciesService) {}

  private currencyConversionRoutes: Map<string, Map<string, string>>

  async onModuleInit() {
    await this.calculateCurrencyConversionRoutes()
  }

  /**
   * Calculates shortes path between all currency pairs
   */
  private async calculateCurrencyConversionRoutes() {
    this.logger.debug('Calculating currency conversion routes')

    const currencies = await this.currenciesService.getAllCurrencies()
    const exchangeRates = await this.currenciesService.getAllExchangeRates()

    const { nextVertex } = findAllPairsShortestPath(
      currencies.map((c) => c.code),
      (fromCC: string, toCC: string) => {
        const er = exchangeRates.find(
          (er) =>
            (er.baseCurrencyCode === fromCC && er.quoteCurrencyCode === toCC) ||
            (er.baseCurrencyCode === toCC && er.quoteCurrencyCode === fromCC),
        )
        return er ? 1 : undefined
      },
    )

    this.currencyConversionRoutes = nextVertex

    this.logger.debug('Calculating currency conversion routes finished.')
  }

  /**
   * Gets list of currency codes in the conversion path between two currencies
   */
  getConversionRoute(
    sourceCurrencyCode: string,
    targetCurrencyCode: string,
  ): string[] {
    const conversionRoute: string[] = [sourceCurrencyCode]

    let currentCode = sourceCurrencyCode
    while (currentCode !== targetCurrencyCode) {
      const nextCurrencyCode = this.currencyConversionRoutes
        .get(currentCode)
        ?.get(targetCurrencyCode)

      if (!nextCurrencyCode) {
        throw new CurrencyConversionError(
          `No conversion route found from currency code ${currentCode} to ${targetCurrencyCode}`,
        )
      }

      conversionRoute.push(nextCurrencyCode)
      currentCode = nextCurrencyCode
    }

    return conversionRoute
  }

  /**
   * Converts an amount between two currencies
   */
  async convertCurrencyAmount(
    amount: Prisma.Decimal,
    sourceCurrencyCode: string,
    targetCurrencyCode: string,
    date?: Date,
  ): Promise<Prisma.Decimal> {
    date = date || startOfDayInUtc(new Date())

    const route = this.getConversionRoute(
      sourceCurrencyCode,
      targetCurrencyCode,
    )

    if (route.length === 1) return amount

    for (let i = 0; i < route.length - 1; i++) {
      const current = route[i]
      const next = route[i + 1]

      try {
        const erPrice = await this.currenciesService.getOneExchangeRatePrice({
          baseCurrencyCode: current,
          quoteCurrencyCode: next,
          date,
        })
        amount = amount.times(erPrice)
      } catch {
        const erPrice = await this.currenciesService.getOneExchangeRatePrice({
          baseCurrencyCode: next,
          quoteCurrencyCode: current,
          date,
        })
        amount = amount.div(erPrice)
      }
    }

    return amount
  }
}
