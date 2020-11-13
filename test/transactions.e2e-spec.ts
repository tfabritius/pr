import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'

import { createApp } from '../src/app.factory'
import {
  createSecurity,
  createTestDepositAccount,
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
  let securityId: number

  const testTransactionMinimal = {
    account: { id: undefined },
    type: 'Payment',
    datetime: '2020-11-01T08:00:00.000Z',
    units: [],
    note: 'comment',
  }

  const testTransactionFull = {
    ...testTransactionMinimal,
    shares: '1.230000',
    security: { id: undefined },
    units: [
      {
        type: 'base',
        amount: '0.01',
        currencyCode: 'EUR',
        originalAmount: '0.01',
        originalCurrencyCode: 'USD',
      },
      {
        type: 'fee',
        amount: '-1.11',
        currencyCode: 'CHF',
      },
    ],
  }

  beforeAll(async () => {
    portfolioId = await createTestPortfolio(http, sessionToken)
    const ids = await createTestDepositSecuritiesAccounts(
      http,
      sessionToken,
      portfolioId,
    )
    ;[depositAccountId, securitiesAccountId] = ids
    securityId = await createSecurity(http, sessionToken, portfolioId)

    testTransactionMinimal.account.id = depositAccountId
    testTransactionFull.account.id = depositAccountId
    testTransactionFull.security.id = securityId
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
          .send(testTransactionMinimal)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(response.status).toBe(404)
        expect(response.body.message).toContain('Transaction not found')
      },
    )
  })

  describe('POST .../transactions', () => {
    it.each(getObjectsWithMissingAttribute(testTransactionMinimal))(
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

    it('returns minimal transaction with id', async () => {
      const createResponse = await request(http)
        .post(`/portfolios/${portfolioId}/transactions`)
        .send(testTransactionMinimal)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(createResponse.status).toBe(201)
      expect(createResponse.body).toMatchObject(testTransactionMinimal)
      expect(typeof createResponse.body.id).toBe('number')
    })

    it('returns full transaction with id', async () => {
      const createResponse = await request(http)
        .post(`/portfolios/${portfolioId}/transactions`)
        .send(testTransactionFull)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(createResponse.status).toBe(201)
      expect(createResponse.body).toMatchObject(testTransactionFull)
      expect(typeof createResponse.body.id).toBe('number')
    })
  })

  describe('GET/PUT/DELETE .../transactions', () => {
    let minTransactionId: number
    let fullTransactionId: number

    beforeEach(async () => {
      minTransactionId = await createTransaction(
        http,
        sessionToken,
        portfolioId,
        testTransactionMinimal,
      )

      fullTransactionId = await createTransaction(
        http,
        sessionToken,
        portfolioId,
        testTransactionFull,
      )
    })

    test('GET .../transactions contains minimal transaction', async () => {
      const response = await request(http)
        .get(`/portfolios/${portfolioId}/transactions`)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(response.status).toBe(200)
      expect(response.body).toContainEqual(
        expect.objectContaining({
          ...testTransactionMinimal,
          id: minTransactionId,
          account: expect.objectContaining({
            id: testTransactionMinimal.account.id,
          }),
        }),
      )
    })

    test('GET .../transactions contains full transaction', async () => {
      const response = await request(http)
        .get(`/portfolios/${portfolioId}/transactions`)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(response.status).toBe(200)
      expect(response.body).toContainEqual(
        expect.objectContaining({
          ...testTransactionFull,
          id: fullTransactionId,
          account: expect.objectContaining({
            id: testTransactionFull.account.id,
          }),
          security: expect.objectContaining({
            id: testTransactionFull.security.id,
          }),
          units: expect.arrayContaining(
            testTransactionFull.units.map((u) => expect.objectContaining(u)),
          ),
        }),
      )
    })

    test('GET .../transactions/$id returns minimal transaction', async () => {
      const response = await request(http)
        .get(`/portfolios/${portfolioId}/transactions/${minTransactionId}`)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject(testTransactionMinimal)
    })

    test('GET .../transactions/$id returns full transaction', async () => {
      const response = await request(http)
        .get(`/portfolios/${portfolioId}/transactions/${fullTransactionId}`)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject(testTransactionFull)
    })

    describe('PUT .../transactions/$id', () => {
      let otherSecurityId
      beforeAll(async () => {
        otherSecurityId = await createSecurity(http, sessionToken, portfolioId)
      })

      it.each(getObjectsWithMissingAttribute(testTransactionMinimal))(
        'fails if attribute %p is missing',
        async (missingAttribute, security) => {
          const response = await request(http)
            .put(`/portfolios/${portfolioId}/transactions/${minTransactionId}`)
            .send(security)
            .set('Authorization', 'bearer ' + sessionToken)

          expect(response.status).toBe(400)
          expect(response.body.message).toContainEqual(
            expect.stringContaining(missingAttribute),
          )
        },
      )

      it('updates minimal attributes of transaction', async () => {
        const changedTransaction = {
          ...testTransactionMinimal,
          type: 'DepositInterest',
          datetime: '2020-11-02T00:00:00.000Z',
          note: 'changed comment',
        }

        const updateResponse = await request(http)
          .put(`/portfolios/${portfolioId}/transactions/${minTransactionId}`)
          .send(changedTransaction)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedTransaction)

        const getResponse = await request(http)
          .get(`/portfolios/${portfolioId}/transactions/${minTransactionId}`)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedTransaction)
      })

      it('updates account of transaction', async () => {
        const otherAccountId = await createTestDepositAccount(
          http,
          sessionToken,
          portfolioId,
        )

        const changedTransaction = {
          ...testTransactionMinimal,
          account: { id: otherAccountId },
        }

        const updateResponse = await request(http)
          .put(`/portfolios/${portfolioId}/transactions/${minTransactionId}`)
          .send(changedTransaction)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedTransaction)

        const getResponse = await request(http)
          .get(`/portfolios/${portfolioId}/transactions/${minTransactionId}`)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedTransaction)
      })

      it('adds optional attributes to transaction', async () => {
        const changedTransaction = {
          ...testTransactionMinimal,
          shares: '5.550000',
          security: { id: otherSecurityId },
        }

        const updateResponse = await request(http)
          .put(`/portfolios/${portfolioId}/transactions/${minTransactionId}`)
          .send(changedTransaction)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedTransaction)

        const getResponse = await request(http)
          .get(`/portfolios/${portfolioId}/transactions/${minTransactionId}`)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedTransaction)
      })

      it('updates optional attributes of transaction', async () => {
        const changedTransaction = {
          ...testTransactionFull,
          shares: '11.220000',
          security: { id: otherSecurityId },
        }

        const updateResponse = await request(http)
          .put(`/portfolios/${portfolioId}/transactions/${minTransactionId}`)
          .send(changedTransaction)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedTransaction)

        const getResponse = await request(http)
          .get(`/portfolios/${portfolioId}/transactions/${minTransactionId}`)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedTransaction)
      })

      it('adds unit to transaction', async () => {
        const changedTransaction = {
          ...testTransactionMinimal,
          units: [{ type: 'tax', amount: '100.00', currencyCode: 'JPY' }],
        }

        const updateResponse = await request(http)
          .put(`/portfolios/${portfolioId}/transactions/${minTransactionId}`)
          .send(changedTransaction)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedTransaction)

        const getResponse = await request(http)
          .get(`/portfolios/${portfolioId}/transactions/${minTransactionId}`)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedTransaction)
      })

      it('removes units from transaction', async () => {
        const changedTransaction = {
          ...testTransactionFull,
          units: testTransactionFull.units.slice(0, 1),
        }

        const updateResponse = await request(http)
          .put(`/portfolios/${portfolioId}/transactions/${minTransactionId}`)
          .send(changedTransaction)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedTransaction)

        const getResponse = await request(http)
          .get(`/portfolios/${portfolioId}/transactions/${minTransactionId}`)
          .set('Authorization', 'bearer ' + sessionToken)

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedTransaction)
        expect(getResponse.body.units).toHaveLength(
          changedTransaction.units.length,
        )
      })
    })

    test('DELETE .../transactions/$id removes transaction', async () => {
      const deleteResponse = await request(http)
        .delete(`/portfolios/${portfolioId}/transactions/${minTransactionId}`)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(deleteResponse.status).toBe(204)
      expect(deleteResponse.body).toStrictEqual({})

      const getResponse = await request(http)
        .get(`/portfolios/${portfolioId}/transactions/${minTransactionId}`)
        .set('Authorization', 'bearer ' + sessionToken)

      expect(getResponse.status).toBe(404)
    })
  })
})
