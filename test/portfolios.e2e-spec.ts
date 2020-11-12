import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'

import { createApp } from '../src/app.factory'
import { registerUser } from './utils'

describe('Portfolios (e2e)', () => {
  let app: INestApplication
  let http: any

  const user = { username: 'test-portfolio', password: 'testpassword' }

  const testPortfolio = {
    name: 'Test Portfolio',
    note: 'Test comment',
    baseCurrencyCode: 'EUR',
  }

  const testMissingAttributes = Object.keys(testPortfolio).map(
    (missingAttribute) => {
      const portfolioCopy = { ...testPortfolio }
      delete portfolioCopy[missingAttribute]
      return [missingAttribute, portfolioCopy]
    },
  )

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

  describe('Without portfolio', () => {
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

    test.each(testMissingAttributes)(
      'POST /portfolios fails if attribute %p is missing',
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
  })

  describe('With one portfolio', () => {
    let createResponse

    beforeAll(async () => {
      createResponse = await request(http)
        .post('/portfolios')
        .send(testPortfolio)
        .set('Authorization', 'bearer ' + sessionToken)
    })

    test('POST /portfolios returns portfolio with id', () => {
      expect(createResponse.status).toBe(201)
      expect(createResponse.body).toMatchObject(testPortfolio)
      expect(typeof createResponse.body.id).toBe('number')
    })

    test('GET /portfolios returns single portfolio', async () => {
      const response = await request(http)
        .get('/portfolios')
        .set('Authorization', 'bearer ' + sessionToken)

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body).toMatchObject([testPortfolio])
    })

    test('GET /portfolios/$id returns portfolio', async () => {
      const response = await request(http)
        .get(`/portfolios/${createResponse.body.id}`)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject(testPortfolio)
    })

    test('PUT /portfolios/$id updates portfolio', async () => {
      const changedPortfolio = {
        name: 'changed name',
        note: 'different note',
        baseCurrencyCode: 'USD',
      }

      const updateResponse = await request(http)
        .put(`/portfolios/${createResponse.body.id}`)
        .send(changedPortfolio)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(updateResponse.status).toBe(200)
      expect(updateResponse.body).toMatchObject(changedPortfolio)

      const getResponse = await request(http)
        .get(`/portfolios/${createResponse.body.id}`)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(getResponse.status).toBe(200)
      expect(getResponse.body).toMatchObject(changedPortfolio)
    })

    test.each(testMissingAttributes)(
      'PUT /portfolios/$id fails if attribute %p is missing',
      async (missingAttribute: string, portfolio) => {
        const updateResponse = await request(http)
          .put(`/portfolios/${createResponse.body.id}`)
          .send(portfolio)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(updateResponse.status).toBe(400)
        expect(updateResponse.body.message).toContainEqual(
          expect.stringContaining(missingAttribute),
        )
      },
    )

    test('DELETE /portfolios/$id deletes portfolio', async () => {
      const response = await request(http)
        .delete(`/portfolios/${createResponse.body.id}`)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(response.status).toBe(204)
      expect(response.body).toStrictEqual({})
    })
  })
})
