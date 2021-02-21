import { INestApplication } from '@nestjs/common'

import { createApp } from '../src/app.factory'
import { ApiClient } from './api.client'

describe('Currencies (e2e)', () => {
  let app: INestApplication
  let api: ApiClient

  beforeAll(async () => {
    app = await createApp('test')
    await app.init()
    api = ApiClient.create(app.getHttpServer())
  }, 30000) // Timeout: 30s

  afterAll(async () => {
    await app.close()
  })

  test('GET /currencies returns list incl. EUR and USD', async () => {
    const response = await api.get('/currencies')

    expect(response.status).toBe(200)
    expect(response.body.length).toBeGreaterThan(10)
    expect(response.body).toContainEqual(
      expect.objectContaining({
        code: 'EUR',
      }),
    )
    expect(response.body).toContainEqual(
      expect.objectContaining({
        code: 'USD',
      }),
    )
  })

  describe('GET /currencies/EUR/USD', () => {
    it('returns exchange rate', async () => {
      const response = await api.get('/currencies/EUR/USD')

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        baseCurrencyCode: 'EUR',
        quoteCurrencyCode: 'USD',
      })
      expect(Array.isArray(response.body.prices)).toBe(true)
    })

    test('?startDate=1999-01-01 contains list of prices', async () => {
      const response = await api.get('/currencies/EUR/USD?startDate=1999-01-01')

      expect(response.body).toMatchObject({
        prices: expect.arrayContaining([
          {
            date: '1999-01-04',
            value: '1.1789',
          },
          {
            date: '1999-01-05',
            value: '1.179',
          },
        ]),
      })
    })

    test('?startDate=1999-01-05 does not contain price of 1999-01-04', async () => {
      const response = await api.get('/currencies/EUR/USD?startDate=1999-01-05')

      expect(response.body).toMatchObject({
        prices: expect.not.arrayContaining([
          {
            date: '1999-01-04',
            value: '1.1789',
          },
        ]),
      })
    })

    it('?startDate=1999-02-29 fails due to invalid date', async () => {
      const response = await api.get('/currencies/EUR/USD?startDate=1999-02-29')

      expect(response.status).toBe(400)
      expect(response.body.message).toContainEqual(
        expect.stringContaining('startDate must be a valid date'),
      )
    })

    it('?startDate=foo fails due to invalid date', async () => {
      const response = await api.get('/currencies/EUR/USD?startDate=foo')

      expect(response.status).toBe(400)
      expect(response.body.message).toContainEqual(
        expect.stringContaining('startDate must be a valid date'),
      )
    })
  })

  test('GET /currencies/USD/EUR returns 404', async () => {
    const response = await api.get('/currencies/USD/EUR')

    expect(response.status).toBe(404)
    expect(response.body.message).toContain('Exchange rate not found')
  })
})
