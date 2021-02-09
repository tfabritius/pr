import { PrismaClient, Exchangerate } from '@prisma/client'

const prisma = new PrismaClient()

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

const exchangeratePricesEurUsd = [
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

async function main() {
  // Create currencies
  for (const code of currencies) {
    await prisma.currency.upsert({
      create: { code },
      update: {},
      where: { code },
    })
  }

  let exchangerateEurUsd: Exchangerate

  // Create exchange rates
  for (const [baseCurrencyCode, quoteCurrencyCode] of exchangerates) {
    const exchangerate = await prisma.exchangerate.upsert({
      create: { baseCurrencyCode, quoteCurrencyCode },
      update: {},
      where: {
        baseCurrencyCode_quoteCurrencyCode: {
          baseCurrencyCode,
          quoteCurrencyCode,
        },
      },
    })

    if (baseCurrencyCode === 'EUR' && quoteCurrencyCode === 'USD') {
      exchangerateEurUsd = exchangerate
    }
  }

  // Store initial data for EUR/USD
  for (const price of exchangeratePricesEurUsd) {
    const date = new Date(price[0])
    const value = price[1]

    await prisma.exchangeratePrice.upsert({
      create: { date, value, exchangerateId: exchangerateEurUsd.id },
      update: { date, value },
      where: {
        exchangerateId_date: { date, exchangerateId: exchangerateEurUsd.id },
      },
    })
  }
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
