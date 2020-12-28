import { INestApplication } from '@nestjs/common'

import { createApp } from '../src/app.factory'
import { ApiClient } from './api.client'

describe('Securities (e2e)', () => {
  let app: INestApplication
  let api: ApiClient

  beforeAll(async () => {
    app = await createApp('test')
    await app.init()
    api = ApiClient.create(app.getHttpServer())
  }, 30000) // Timeout: 30s

  const user = { username: 'test-securities-prices', password: 'testpassword' }

  beforeAll(async () => {
    await api.cleanUser(user, false)
    ;[api] = await api.register(user)
  })

  let portfolioId: number

  beforeAll(async () => {
    portfolioId = await api.createPortfolio()
  })

  afterAll(async () => {
    await api.cleanUser(user)
    await app.close()
  })

  describe('GET/PATCH .../securities/.../prices', () => {
    let securityId: number

    beforeEach(async () => {
      securityId = await api.createSecurity(portfolioId)
    })

    test('GET .../securities/$id/prices returns prices', async () => {
      const response = await api.get(
        `/portfolios/${portfolioId}/securities/${securityId}/prices`,
      )

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body).toHaveLength(0)
    })

    test('GET .../securities/$id returns no latestPriceDate', async () => {
      const response = await api.get(
        `/portfolios/${portfolioId}/securities/${securityId}`,
      )

      expect(response.status).toBe(200)
      expect(response.body.latestPriceDate).toBe(null)
    })

    test('PATCH .../prices returns prices', async () => {
      const response = await api.patch(
        `/portfolios/${portfolioId}/securities/${securityId}/prices`,
        [
          { date: '2020-12-01', value: '100.00' },
          { date: '2020-12-02', value: '101.01' },
        ],
      )

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body).toHaveLength(2)
      expect(response.body).toContainEqual({
        date: '2020-12-01',
        value: '100.0000',
      })
      expect(response.body).toContainEqual({
        date: '2020-12-02',
        value: '101.0100',
      })
    })

    describe('with prices', () => {
      beforeEach(async () => {
        const response = await api.patch(
          `/portfolios/${portfolioId}/securities/${securityId}/prices`,
          [
            { date: '2020-12-01', value: '100.00' },
            { date: '2020-12-02', value: '101.01' },
            { date: '2020-12-03', value: '102.02' },
          ],
        )
        expect(response.status).toBe(200)
      })

      test('GET .../securities/$id/prices returns prices', async () => {
        const response = await api.get(
          `/portfolios/${portfolioId}/securities/${securityId}/prices`,
        )

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body).toHaveLength(3)
        expect(response.body).toContainEqual({
          date: '2020-12-01',
          value: '100.0000',
        })
        expect(response.body).toContainEqual({
          date: '2020-12-02',
          value: '101.0100',
        })
        expect(response.body).toContainEqual({
          date: '2020-12-03',
          value: '102.0200',
        })
      })

      test('GET .../securities/$id/prices?startDate=2020-12-02 returns filtered prices', async () => {
        const response = await api.get(
          `/portfolios/${portfolioId}/securities/${securityId}/prices?startDate=2020-12-02`,
        )

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body).toHaveLength(2)
        expect(response.body).toContainEqual(
          expect.objectContaining({
            date: '2020-12-02',
          }),
        )
        expect(response.body).toContainEqual(
          expect.objectContaining({
            date: '2020-12-03',
          }),
        )
      })

      test('GET .../securities/$id/prices?endDate=2020-12-02 returns filtered prices', async () => {
        const response = await api.get(
          `/portfolios/${portfolioId}/securities/${securityId}/prices?endDate=2020-12-02`,
        )

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body).toHaveLength(2)
        expect(response.body).toContainEqual(
          expect.objectContaining({
            date: '2020-12-01',
          }),
        )
        expect(response.body).toContainEqual(
          expect.objectContaining({
            date: '2020-12-02',
          }),
        )
      })

      test('GET .../securities/$id returns latestPriceDate', async () => {
        const response = await api.get(
          `/portfolios/${portfolioId}/securities/${securityId}`,
        )

        expect(response.status).toBe(200)
        expect(response.body.latestPriceDate).toBe('2020-12-03')
      })

      test('PATCH .../prices returns prices', async () => {
        const response = await api.patch(
          `/portfolios/${portfolioId}/securities/${securityId}/prices`,
          [
            { date: '2020-12-03', value: '103.03' },
            { date: '2020-12-04', value: '104.04' },
          ],
        )

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body).toHaveLength(2)
        expect(response.body).toContainEqual({
          date: '2020-12-03',
          value: '103.0300',
        })
        expect(response.body).toContainEqual({
          date: '2020-12-04',
          value: '104.0400',
        })
      })
    })
  })
})