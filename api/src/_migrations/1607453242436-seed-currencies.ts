import { getRepository, MigrationInterface } from 'typeorm'

import { Currency } from '../currencies/currency.entity'
import { ExchangeRate } from '../currencies/exchangerate.entity'

const ecbCurrencies = [
  // except EUR
  'AUD',
  'BGN',
  'BRL',
  'CAD',
  'CHF',
  'CNY',
  'CZK',
  'DKK',
  'GBP',
  'HKD',
  'HRK',
  'HUF',
  'IDR',
  'ILS',
  'INR',
  'ISK',
  'JPY',
  'KRW',
  'MXN',
  'MYR',
  'NOK',
  'NZD',
  'PHP',
  'PLN',
  'RON',
  'RUB',
  'SEK',
  'SGD',
  'THB',
  'TRY',
  'USD',
  'ZAR',
]

const currencies = ['EUR', ...ecbCurrencies, 'GBX', 'AED']

const exchangerates = [
  ...ecbCurrencies.map((code) => ['EUR', code]),
  ['GBP', 'GBX'],
  ['USD', 'AED'],
]

const exchangeRateEurUsd = [
  ['1999-01-04', '1.1789'],
  ['1999-01-05', '1.1790'],
  ['1999-01-06', '1.1743'],
  ['1999-01-07', '1.1632'],
  ['1999-01-08', '1.1659'],
  ['1999-01-11', '1.1569'],
  ['1999-01-12', '1.1520'],
  ['1999-01-13', '1.1744'],
  ['1999-01-14', '1.1653'],
  ['1999-01-15', '1.1626'],
  ['1999-01-18', '1.1612'],
  ['1999-01-19', '1.1616'],
  ['1999-01-20', '1.1575'],
  ['1999-01-21', '1.1572'],
  ['1999-01-22', '1.1567'],
  ['1999-01-25', '1.1584'],
  ['1999-01-26', '1.1582'],
  ['1999-01-27', '1.1529'],
  ['1999-01-28', '1.1410'],
  ['1999-01-29', '1.1384'],
]

export class seedCurrencies1607453242436 implements MigrationInterface {
  public async up(): Promise<void> {
    // Create currencies
    for (const code of currencies) {
      await getRepository(Currency).insert({ code })
    }

    let idEurUsd: number

    // Create exchange rates
    for (const [baseCurrencyCode, quoteCurrencyCode] of exchangerates) {
      const er = await getRepository(ExchangeRate).save({
        baseCurrencyCode,
        quoteCurrencyCode,
      })

      if (baseCurrencyCode === 'EUR' && quoteCurrencyCode === 'USD') {
        idEurUsd = er.id
      }
    }

    // Store initial data for EUR/USD
    await getRepository(ExchangeRate).save({
      id: idEurUsd,
      prices: exchangeRateEurUsd.map((el) => ({ date: el[0], value: el[1] })),
    })
  }

  public async down(): Promise<void> {
    // Delete exchange rates
    for (const [baseCurrencyCode, quoteCurrencyCode] of exchangerates) {
      await getRepository(ExchangeRate).delete({
        baseCurrencyCode,
        quoteCurrencyCode,
      })
    }

    // Delete currencies
    for (const code of currencies) {
      await getRepository(Currency).delete({ code })
    }
  }
}
