import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'

import { createApp } from '../src/app.factory'
import {
  createTestDepositSecuritiesAccounts,
  createTestPortfolio,
  createTransaction,
  getObjectsWithMissingAttribute,
  registerUser,
} from './utils'

describe('Transactions (e2e)', () => {
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

  const user = { username: 'test-transactions', password: 'testpassword' }
  let sessionToken: string

  beforeAll(async () => {
    sessionToken = await registerUser(http, user)
  })

  let portfolioId: number
  let depositAccountId: number
  let securitiesAccountId: number

  const testTransaction = {
    account: { id: undefined },
    type: 'Payment',
    datetime: '2020-11-01T08:00:00.000Z',
    // partnerTransaction
    units: [],
    // shares
    // security
    note: 'comment',
  }

  beforeAll(async () => {
    portfolioId = await createTestPortfolio(http, sessionToken)
    const ids = await createTestDepositSecuritiesAccounts(
      http,
      sessionToken,
      portfolioId,
    )
    ;[depositAccountId, securitiesAccountId] = ids
    testTransaction.account.id = depositAccountId
  })

  test('GET .../transactions returns empty list', async () => {
    const response = await request(http)
      .get(`/portfolios/${portfolioId}/transactions`)
      .set('Authorization', 'bearer ' + sessionToken)

    expect(response.status).toBe(200)
    expect(response.body).toStrictEqual([])
  })

  describe('404s', () => {
    test.each([
      ['GET', '/transactions'],
      ['GET', '/transactions/42'],
      ['PUT', '/transactions/42'],
      ['DELETE', '/transactions/42'],
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
      '%s .../transactions/42 returns 404 Transaction not found',
      async (method) => {
        const response = await request(http)
          [method.toLowerCase()](`/portfolios/${portfolioId}/transactions/42`)
          .send(testTransaction)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(response.status).toBe(404)
        expect(response.body.message).toContain('Transaction not found')
      },
    )
  })

  describe('POST .../transactions', () => {
    it.each(getObjectsWithMissingAttribute(testTransaction))(
      `fails if attribute %p is missing`,
      async (missingAttribute, transaction) => {
        const response = await request(http)
          .post(`/portfolios/${portfolioId}/transactions`)
          .send(transaction)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(response.status).toBe(400)
        expect(response.body.message).toContainEqual(
          expect.stringContaining(missingAttribute),
        )
      },
    )

    test('returns transaction with id', async () => {
      const createResponse = await request(http)
        .post(`/portfolios/${portfolioId}/transactions`)
        .send(testTransaction)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(createResponse.status).toBe(201)
      expect(createResponse.body).toMatchObject(testTransaction)
      expect(typeof createResponse.body.id).toBe('number')
    })
  })

  describe('GET/PUT/DELETE .../transactions', () => {
    let transactionId: number

    beforeEach(async () => {
      transactionId = await createTransaction(
        http,
        sessionToken,
        portfolioId,
        testTransaction,
      )
    })

    test('GET .../transactions contains transaction', async () => {
      const response = await request(http)
        .get(`/portfolios/${portfolioId}/transactions`)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(response.status).toBe(200)
      expect(response.body).toContainEqual(
        expect.objectContaining({
          ...testTransaction,
          id: transactionId,
          account: expect.objectContaining({ id: testTransaction.account.id }),
        }),
      )
    })

    test('GET .../transactions/$id returns transaction', async () => {
      const response = await request(http)
        .get(`/portfolios/${portfolioId}/transactions/${transactionId}`)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject(testTransaction)
    })

    describe('PUT .../transactions/$id', () => {
      it.each(getObjectsWithMissingAttribute(testTransaction))(
        'fails if attribute %p is missing',
        async (missingAttribute, security) => {
          const response = await request(http)
            .put(`/portfolios/${portfolioId}/transactions/${transactionId}`)
            .send(security)
            .set('Authorization', 'bearer ' + sessionToken)

          expect(response.status).toBe(400)
          expect(response.body.message).toContainEqual(
            expect.stringContaining(missingAttribute),
          )
        },
      )

      it('updates the transactions', async () => {
        const changedTransaction = {
          ...testTransaction,
          type: 'DepositInterest',
          datetime: '2020-11-02T00:00:00.000Z',
          note: 'changed comment',
        }

        const updateResponse = await request(http)
          .put(`/portfolios/${portfolioId}/transactions/${transactionId}`)
          .send(changedTransaction)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedTransaction)

        const getResponse = await request(http)
          .get(`/portfolios/${portfolioId}/transactions/${transactionId}`)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedTransaction)
      })
    })

    test('DELETE .../transactions/$id removes transaction', async () => {
      const deleteResponse = await request(http)
        .delete(`/portfolios/${portfolioId}/transactions/${transactionId}`)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(deleteResponse.status).toBe(204)
      expect(deleteResponse.body).toStrictEqual({})

      const getResponse = await request(http)
        .get(`/portfolios/${portfolioId}/transactions/${transactionId}`)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(getResponse.status).toBe(404)
    })
  })
})
