import { Injectable, Logger } from '@nestjs/common'
import { Timeout } from '@nestjs/schedule'
import Big from 'big.js'

import { findAllPairsShortestPath } from '../utils/floyd.warshall'
import { CurrenciesService } from './currencies.service'

@Injectable()
export class CurrenciesConversionService {
  private readonly logger = new Logger(CurrenciesConversionService.name)

  constructor(private readonly currenciesService: CurrenciesService) {}

  private currencyConversionRoutes: Map<string, Map<string, string>>

  /**
   * Calculates shortes path between all currency pairs
   */
  @Timeout(10)
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
        throw new Error(
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
    amount: Big,
    sourceCurrencyCode: string,
    targetCurrencyCode: string,
  ): Promise<Big> {
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
        })
        amount = amount.times(erPrice)
      } catch {
        const erPrice = await this.currenciesService.getOneExchangeRatePrice({
          baseCurrencyCode: next,
          quoteCurrencyCode: current,
        })
        amount = amount.div(erPrice)
      }
    }

    return amount
  }
}
