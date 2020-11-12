import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'

import { createApp } from '../src/app.factory'
import {
  createSecurity,
  createTestPortfolio,
  getObjectsWithMissingAttribute,
  registerUser,
} from './utils'

describe('Securities (e2e)', () => {
  let app: INestApplication
  let http: any

  beforeAll(async () => {
    app = await createApp('test')
    await app.init()
    http = app.getHttpServer()
  }, 30000) // Timeout: 30s

  afterAll(async () => {
    await app.close()
  })

  const user = { username: 'test-securities', password: 'testpassword' }
  let sessionToken: string

  beforeAll(async () => {
    sessionToken = await registerUser(http, user)
  })

  let portfolioId: number

  beforeAll(async () => {
    portfolioId = await createTestPortfolio(http, sessionToken)
  })

  const testSecurity = {
    name: 'Test security',
    uuid: '42',
    note: 'comment',
    currencyCode: 'EUR',
    isin: 'some isin',
    wkn: 'some wkn',
    symbol: 'some symbol',
  }

  test('GET .../securities returns empty list', async () => {
    const response = await request(http)
      .get(`/portfolios/${portfolioId}/securities`)
      .set('Authorization', 'bearer ' + sessionToken)

    expect(response.status).toBe(200)
    expect(response.body).toStrictEqual([])
  })

  describe('404s', () => {
    test.each([
      ['GET', '/securities'],
      ['GET', '/securities/42'],
      ['PUT', '/securities/42'],
      ['DELETE', '/securities/42'],
    ])(
      '%s /portfolios/42%s returns 404 Portfolio not found',
      async (method, url) => {
        const response = await request(http)
          [method.toLowerCase()](`/portfolios/42${url}`)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(response.status).toBe(404)
        expect(response.body.message).toContain('Portfolio not found')
      },
    )

    test.each([['GET'], ['PUT'], ['DELETE']])(
      '%s .../securities/42 returns 404 Security not found',
      async (method) => {
        const response = await request(http)
          [method.toLowerCase()](`/portfolios/${portfolioId}/securities/42`)
          .send(testSecurity)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(response.status).toBe(404)
        expect(response.body.message).toContain('Security not found')
      },
    )
  })

  describe('POST .../securities', () => {
    it.each(getObjectsWithMissingAttribute(testSecurity))(
      `fails if attribute %p is missing`,
      async (missingAttribute, security) => {
        const response = await request(http)
          .post(`/portfolios/${portfolioId}/securities`)
          .send(security)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(response.status).toBe(400)
        expect(response.body.message).toContainEqual(
          expect.stringContaining(missingAttribute),
        )
      },
    )

    test('returns security with id', async () => {
      const createResponse = await request(http)
        .post(`/portfolios/${portfolioId}/securities`)
        .send(testSecurity)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(createResponse.status).toBe(201)
      expect(createResponse.body).toMatchObject(testSecurity)
      expect(typeof createResponse.body.id).toBe('number')
    })
  })

  describe('GET/PUT/DELETE .../securities', () => {
    let securityId: number

    beforeEach(async () => {
      securityId = await createSecurity(
        http,
        sessionToken,
        portfolioId,
        testSecurity,
      )
    })

    test('GET .../securities contains security', async () => {
      const response = await request(http)
        .get(`/portfolios/${portfolioId}/securities`)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(response.status).toBe(200)
      expect(response.body).toContainEqual(
        expect.objectContaining({
          ...testSecurity,
          id: securityId,
        }),
      )
    })

    test('GET .../securities/$id returns security', async () => {
      const response = await request(http)
        .get(`/portfolios/${portfolioId}/securities/${securityId}`)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject(testSecurity)
    })

    describe('PUT .../securities/$id', () => {
      it.each(getObjectsWithMissingAttribute(testSecurity))(
        'fails if attribute %p is missing',
        async (missingAttribute, security) => {
          const response = await request(http)
            .put(`/portfolios/${portfolioId}/securities/${securityId}`)
            .send(security)
            .set('Authorization', 'bearer ' + sessionToken)

          expect(response.status).toBe(400)
          expect(response.body.message).toContainEqual(
            expect.stringContaining(missingAttribute),
          )
        },
      )

      it('updates the security', async () => {
        const changedSecurity = {
          name: 'changed security',
          uuid: '',
          note: 'different note',
          currencyCode: 'CHF',
          isin: 'another isin',
          wkn: 'another wkn',
          symbol: 'another symbol',
        }

        const updateResponse = await request(http)
          .put(`/portfolios/${portfolioId}/securities/${securityId}`)
          .send(changedSecurity)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedSecurity)

        const getResponse = await request(http)
          .get(`/portfolios/${portfolioId}/securities/${securityId}`)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedSecurity)
      })
    })

    test('DELETE .../securities/$id removes security', async () => {
      const deleteResponse = await request(http)
        .delete(`/portfolios/${portfolioId}/securities/${securityId}`)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(deleteResponse.status).toBe(204)
      expect(deleteResponse.body).toStrictEqual({})

      const getResponse = await request(http)
        .get(`/portfolios/${portfolioId}/securites/${securityId}`)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(getResponse.status).toBe(404)
    })
  })
})
