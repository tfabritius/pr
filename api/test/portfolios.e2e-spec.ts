import { INestApplication } from '@nestjs/common'

import { createApp } from '../src/app.factory'
import { ApiClient } from './api.client'
import { getObjectsWithMissingAttribute } from './utils'

describe('Portfolios (e2e)', () => {
  let app: INestApplication
  let api: ApiClient

  const user = { username: 'test-portfolio', password: 'testpassword' }

  const testPortfolio = {
    name: 'Test Portfolio',
    note: 'Test comment',
    baseCurrencyCode: 'EUR',
  }

  beforeAll(async () => {
    app = await createApp('test')
    await app.init()
    api = ApiClient.create(app.getHttpServer())

    await api.cleanUser(user, false)
    ;[api] = await api.register(user)
  }, 30000) // Timeout: 30s

  afterAll(async () => {
    await api.cleanUser(user)
    await app.close()
  })

  test('GET /portfolios returns empty list', async () => {
    const response = await api.get('/portfolios')
    expect(response.status).toBe(200)
    expect(response.body).toStrictEqual([])
  })

  test.each([['GET'], ['PUT'], ['DELETE']])(
    '%s /portfolios/42 returns 404',
    async (method) => {
      const response = await api[method.toLowerCase()]('/portfolios/42')
      expect(response.status).toBe(404)
    },
  )

  describe('POST /portfolios', () => {
    it.each(getObjectsWithMissingAttribute(testPortfolio))(
      'fails if attribute %p is missing',
      async (missingAttribute: string, portfolio) => {
        const response = await api.post('/portfolios', portfolio)
        expect(response.status).toBe(400)
        expect(response.body.message).toContainEqual(
          expect.stringContaining(missingAttribute),
        )
      },
    )

    it('returns portfolio with id', async () => {
      const createResponse = await api.post('/portfolios', testPortfolio)
      expect(createResponse.status).toBe(201)
      expect(createResponse.body).toMatchObject(testPortfolio)
      expect(typeof createResponse.body.id).toBe('number')
    })
  })

  describe('GET/PUT/DELETE /portfolios', () => {
    let portfolioId: number

    beforeEach(async () => {
      portfolioId = await api.createPortfolio(testPortfolio)
    })

    test('GET /portfolios contains portfolio', async () => {
      const response = await api.get('/portfolios')
      expect(response.status).toBe(200)
      expect(response.body).toContainEqual(
        expect.objectContaining({
          ...testPortfolio,
          id: portfolioId,
        }),
      )
    })

    test('GET /portfolios/$id returns portfolio', async () => {
      const response = await api.get(`/portfolios/${portfolioId}`)
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject(testPortfolio)
    })

    describe('PUT /portfolios/$id', () => {
      it.each(getObjectsWithMissingAttribute(testPortfolio))(
        'fails if attribute %p is missing',
        async (missingAttribute: string, portfolio) => {
          const updateResponse = await api.put(
            `/portfolios/${portfolioId}`,
            portfolio,
          )

          expect(updateResponse.status).toBe(400)
          expect(updateResponse.body.message).toContainEqual(
            expect.stringContaining(missingAttribute),
          )
        },
      )

      it('updates portfolio', async () => {
        const changedPortfolio = {
          name: 'changed name',
          note: 'different note',
          baseCurrencyCode: 'USD',
        }

        const updateResponse = await api.put(
          `/portfolios/${portfolioId}`,
          changedPortfolio,
        )

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedPortfolio)

        const getResponse = await api.get(`/portfolios/${portfolioId}`)
        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedPortfolio)
      })

      it('does not update "id"', async () => {
        const updateResponse = await api.put(`/portfolios/${portfolioId}`, {
          ...testPortfolio,
          id: portfolioId + 666,
        })

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body.id).toBe(portfolioId)

        const getResponse = await api.get(`/portfolios/${portfolioId}`)
        expect(getResponse.status).toBe(200)
      })
    })

    test('DELETE /portfolios/$id removes portfolio', async () => {
      const response = await api.delete(`/portfolios/${portfolioId}`)
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject(testPortfolio)

      const getResponse = await api.get(`/portfolios/${portfolioId}`)
      expect(getResponse.status).toBe(404)
    })
  })
})
