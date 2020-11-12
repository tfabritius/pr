import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'

import { createApp } from '../src/app.factory'
import {
  createPortfolio,
  createTestPortfolio,
  getObjectsWithMissingAttribute,
  registerUser,
} from './utils'

describe('Portfolios (e2e)', () => {
  let app: INestApplication
  let http: any

  const user = { username: 'test-portfolio', password: 'testpassword' }

  const testPortfolio = {
    name: 'Test Portfolio',
    note: 'Test comment',
    baseCurrencyCode: 'EUR',
  }

  beforeAll(async () => {
    app = await createApp('test')
    await app.init()
    http = app.getHttpServer()
    // http = 'http://localhost:3000'
  }, 30000) // Timeout: 30s

  let sessionToken: string

  beforeAll(async () => {
    sessionToken = await registerUser(http, user)
  })

  afterAll(async () => {
    await app.close()
  })

  test('GET /portfolios returns empty list', async () => {
    const response = await request(http)
      .get('/portfolios')
      .set('Authorization', 'bearer ' + sessionToken)

    expect(response.status).toBe(200)
    expect(response.body).toStrictEqual([])
  })

  test.each([['GET'], ['PUT'], ['DELETE']])(
    '%s /portfolios/42 returns 404',
    async (method) => {
      const response = await request(http)
        [method.toLowerCase()]('/portfolios/42')
        .set('Authorization', 'bearer ' + sessionToken)

      expect(response.status).toBe(404)
    },
  )

  describe('POST /portfolios', () => {
    it.each(getObjectsWithMissingAttribute(testPortfolio))(
      'fails if attribute %p is missing',
      async (missingAttribute: string, portfolio) => {
        const response = await request(http)
          .post('/portfolios')
          .send(portfolio)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(response.status).toBe(400)
        expect(response.body.message).toContainEqual(
          expect.stringContaining(missingAttribute),
        )
      },
    )

    it('returns portfolio with id', async () => {
      const createResponse = await request(http)
        .post('/portfolios')
        .send(testPortfolio)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(createResponse.status).toBe(201)
      expect(createResponse.body).toMatchObject(testPortfolio)
      expect(typeof createResponse.body.id).toBe('number')
    })
  })

  describe('GET/PUT/DELETE /portfolios', () => {
    let portfolioId: number

    beforeEach(async () => {
      portfolioId = await createPortfolio(http, sessionToken, testPortfolio)
    })

    test('GET /portfolios contains portfolio', async () => {
      const response = await request(http)
        .get('/portfolios')
        .set('Authorization', 'bearer ' + sessionToken)

      expect(response.status).toBe(200)
      expect(response.body).toContainEqual(
        expect.objectContaining({
          ...testPortfolio,
          id: portfolioId,
        }),
      )
    })

    test('GET /portfolios/$id returns portfolio', async () => {
      const response = await request(http)
        .get(`/portfolios/${portfolioId}`)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject(testPortfolio)
    })

    describe('PUT /portfolios/$id', () => {
      it.each(getObjectsWithMissingAttribute(testPortfolio))(
        'fails if attribute %p is missing',
        async (missingAttribute: string, portfolio) => {
          const updateResponse = await request(http)
            .put(`/portfolios/${portfolioId}`)
            .send(portfolio)
            .set('Authorization', 'bearer ' + sessionToken)

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

        const updateResponse = await request(http)
          .put(`/portfolios/${portfolioId}`)
          .send(changedPortfolio)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedPortfolio)

        const getResponse = await request(http)
          .get(`/portfolios/${portfolioId}`)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedPortfolio)
      })
    })

    test('DELETE /portfolios/$id removes portfolio', async () => {
      const response = await request(http)
        .delete(`/portfolios/${portfolioId}`)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(response.status).toBe(204)
      expect(response.body).toStrictEqual({})

      const getResponse = await request(http)
        .get(`/portfolios/${portfolioId}`)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(getResponse.status).toBe(404)
    })
  })
})
