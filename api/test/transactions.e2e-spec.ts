import { INestApplication } from '@nestjs/common'

import { createApp } from '../src/app.factory'
import { ApiClient } from './api.client'
import { getObjectsWithMissingAttribute } from './utils'

describe('Transactions (e2e)', () => {
  let app: INestApplication
  let api: ApiClient

  beforeAll(async () => {
    app = await createApp('test')
    await app.init()
    api = ApiClient.create(app.getHttpServer())
  }, 30000) // Timeout: 30s

  const user = { username: 'test-transactions', password: 'testpassword' }

  beforeAll(async () => {
    await api.cleanUser(user, false)
    ;[api] = await api.register(user)
  })

  let portfolioId: number
  let depositAccountId: number
  let securitiesAccountId: number
  let securityId: number

  const testTransactionMinimal = {
    accountId: undefined,
    type: 'Payment',
    datetime: '2020-11-01T08:00:00.000Z',
    units: [],
    note: 'comment',
  }

  const testTransactionFull = {
    ...testTransactionMinimal,
    shares: '1.23',
    securityId: undefined,
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
    portfolioId = await api.createPortfolio()
    const ids = await api.createTestDepositSecuritiesAccounts(portfolioId)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;[depositAccountId, securitiesAccountId] = ids
    securityId = await api.createSecurity(portfolioId)

    testTransactionMinimal.accountId = depositAccountId
    testTransactionFull.accountId = depositAccountId
    testTransactionFull.securityId = securityId
  })

  afterAll(async () => {
    await api.cleanUser(user)
    await app.close()
  })

  test('GET .../transactions returns empty list', async () => {
    const response = await api.get(`/portfolios/${portfolioId}/transactions`)

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
        const response = await api[method.toLowerCase()](`/portfolios/42${url}`)

        expect(response.status).toBe(404)
        expect(response.body.message).toContain('Portfolio not found')
      },
    )

    test.each([
      ['GET', undefined],
      ['PUT', testTransactionMinimal],
      ['DELETE', undefined],
    ])(
      '%s .../transactions/42 returns 404 Transaction not found',
      async (method, payload) => {
        const args: any[] = [`/portfolios/${portfolioId}/transactions/42`]
        if (payload) {
          args.push(payload)
        }
        const response = await api[method.toLowerCase()](...args)

        expect(response.status).toBe(404)
        expect(response.body.message).toContain('Transaction not found')
      },
    )
  })

  describe('POST .../transactions', () => {
    it.each(getObjectsWithMissingAttribute(testTransactionMinimal))(
      `fails if attribute %p is missing`,
      async (missingAttribute, transaction) => {
        const response = await api.post(
          `/portfolios/${portfolioId}/transactions`,
          transaction,
        )

        expect(response.status).toBe(400)
        expect(response.body.message).toContainEqual(
          expect.stringContaining(missingAttribute),
        )
      },
    )

    it('returns minimal transaction with id', async () => {
      const createResponse = await api.post(
        `/portfolios/${portfolioId}/transactions`,
        testTransactionMinimal,
      )

      expect(createResponse.status).toBe(201)
      expect(createResponse.body).toMatchObject(testTransactionMinimal)
      expect(typeof createResponse.body.id).toBe('number')
    })

    it('returns full transaction with id', async () => {
      const createResponse = await api.post(
        `/portfolios/${portfolioId}/transactions`,
        testTransactionFull,
      )

      expect(createResponse.status).toBe(201)
      expect(createResponse.body).toMatchObject(testTransactionFull)
      expect(typeof createResponse.body.id).toBe('number')
    })
  })

  describe('GET/PUT/DELETE .../transactions', () => {
    let minTransactionId: number
    let fullTransactionId: number

    beforeEach(async () => {
      minTransactionId = await api.createTransaction(
        portfolioId,
        testTransactionMinimal,
      )

      fullTransactionId = await api.createTransaction(
        portfolioId,
        testTransactionFull,
      )
    })

    test('GET .../transactions contains minimal transaction', async () => {
      const response = await api.get(`/portfolios/${portfolioId}/transactions`)

      expect(response.status).toBe(200)
      expect(response.body).toContainEqual(
        expect.objectContaining({
          ...testTransactionMinimal,
          id: minTransactionId,
        }),
      )
    })

    test('GET .../transactions contains full transaction', async () => {
      const response = await api.get(`/portfolios/${portfolioId}/transactions`)

      expect(response.status).toBe(200)
      expect(response.body).toContainEqual(
        expect.objectContaining({
          ...testTransactionFull,
          id: fullTransactionId,
          units: expect.arrayContaining(
            testTransactionFull.units.map((u) => expect.objectContaining(u)),
          ),
        }),
      )
    })

    test('GET .../transactions/$id returns minimal transaction', async () => {
      const response = await api.get(
        `/portfolios/${portfolioId}/transactions/${minTransactionId}`,
      )

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject(testTransactionMinimal)
    })

    test('GET .../transactions/$id returns full transaction', async () => {
      const response = await api.get(
        `/portfolios/${portfolioId}/transactions/${fullTransactionId}`,
      )

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject(testTransactionFull)
    })

    describe('PUT .../transactions/$id', () => {
      let otherSecurityId
      beforeAll(async () => {
        otherSecurityId = await api.createSecurity(portfolioId)
      })

      it.each(getObjectsWithMissingAttribute(testTransactionMinimal))(
        'fails if attribute %p is missing',
        async (missingAttribute, transaction) => {
          const response = await api.put(
            `/portfolios/${portfolioId}/transactions/${minTransactionId}`,
            transaction,
          )

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

        const updateResponse = await api.put(
          `/portfolios/${portfolioId}/transactions/${minTransactionId}`,
          changedTransaction,
        )

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedTransaction)

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/transactions/${minTransactionId}`,
        )

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedTransaction)
      })

      it('updates account of transaction', async () => {
        const [otherAccountId] = await api.createTestDepositSecuritiesAccounts(
          portfolioId,
        )

        const changedTransaction = {
          ...testTransactionMinimal,
          accountId: otherAccountId,
        }

        const updateResponse = await api.put(
          `/portfolios/${portfolioId}/transactions/${minTransactionId}`,
          changedTransaction,
        )

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedTransaction)

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/transactions/${minTransactionId}`,
        )

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedTransaction)
      })

      it('adds optional attributes to transaction', async () => {
        const changedTransaction = {
          ...testTransactionMinimal,
          shares: '5.55',
          securityId: otherSecurityId,
        }

        const updateResponse = await api.put(
          `/portfolios/${portfolioId}/transactions/${minTransactionId}`,
          changedTransaction,
        )

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedTransaction)

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/transactions/${minTransactionId}`,
        )

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedTransaction)
      })

      it('updates optional attributes of transaction', async () => {
        const changedTransaction = {
          ...testTransactionFull,
          shares: '11.22',
          securityId: otherSecurityId,
        }

        const updateResponse = await api.put(
          `/portfolios/${portfolioId}/transactions/${minTransactionId}`,
          changedTransaction,
        )

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedTransaction)

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/transactions/${minTransactionId}`,
        )

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedTransaction)
      })

      it('adds unit to transaction', async () => {
        const changedTransaction = {
          ...testTransactionMinimal,
          units: [{ type: 'tax', amount: '100', currencyCode: 'JPY' }],
        }

        const updateResponse = await api.put(
          `/portfolios/${portfolioId}/transactions/${minTransactionId}`,
          changedTransaction,
        )

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedTransaction)

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/transactions/${minTransactionId}`,
        )

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedTransaction)
      })

      it('removes units from transaction', async () => {
        const changedTransaction = {
          ...testTransactionFull,
          units: testTransactionFull.units.slice(0, 1),
        }

        const updateResponse = await api.put(
          `/portfolios/${portfolioId}/transactions/${minTransactionId}`,
          changedTransaction,
        )

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedTransaction)

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/transactions/${minTransactionId}`,
        )

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedTransaction)
        expect(getResponse.body.units).toHaveLength(
          changedTransaction.units.length,
        )
      })

      it('does not update "id"', async () => {
        const updateResponse = await api.put(
          `/portfolios/${portfolioId}/transactions/${minTransactionId}`,
          {
            ...testTransactionMinimal,
            id: minTransactionId + 666,
          },
        )

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body.id).toBe(minTransactionId)

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/transactions/${minTransactionId}`,
        )
        expect(getResponse.status).toBe(200)
      })
    })

    test('DELETE .../transactions/$id removes transaction', async () => {
      const deleteResponse = await api.delete(
        `/portfolios/${portfolioId}/transactions/${minTransactionId}`,
      )

      expect(deleteResponse.status).toBe(204)
      expect(deleteResponse.body).toStrictEqual({})

      const getResponse = await api.get(
        `/portfolios/${portfolioId}/transactions/${minTransactionId}`,
      )

      expect(getResponse.status).toBe(404)
    })
  })
})
