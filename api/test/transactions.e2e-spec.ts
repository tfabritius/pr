import { INestApplication } from '@nestjs/common'
import { differenceInMilliseconds, differenceInSeconds } from 'date-fns'

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
  let depositAccountUuid: string
  let securitiesAccountUuid: string
  let securityUuid: string

  const testTransactionMinimal = {
    accountUuid: undefined,
    type: 'Payment',
    datetime: '2020-11-01T08:00:00.000Z',
    units: [],
  }

  const testTransactionFull = {
    ...testTransactionMinimal,
    shares: '1.23',
    note: 'comment',
    portfolioSecurityUuid: undefined,
    updatedAt: '2021-03-01T09:00:00.000Z',
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
    ;[depositAccountUuid, securitiesAccountUuid] = ids
    securityUuid = await api.createSecurity(portfolioId)

    testTransactionMinimal.accountUuid = depositAccountUuid
    testTransactionFull.accountUuid = depositAccountUuid
    testTransactionFull.portfolioSecurityUuid = securityUuid
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
      ['DELETE', undefined],
    ])(
      '%s .../transactions/42 returns 404 Transaction not found',
      async (method, payload) => {
        const args: any[] = [
          `/portfolios/${portfolioId}/transactions/11111111-1111-1111-1111-111111111111`,
        ]
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

    it('returns minimal transaction with uuid', async () => {
      const createResponse = await api.post(
        `/portfolios/${portfolioId}/transactions`,
        testTransactionMinimal,
      )

      expect(createResponse.status).toBe(201)
      expect(createResponse.body).toMatchObject(testTransactionMinimal)
      expect(typeof createResponse.body.uuid).toBe('string')
    })

    it('sets updatedAt to current date/time (if not given)', async () => {
      const createResponse = await api.post(
        `/portfolios/${portfolioId}/transactions`,
        testTransactionMinimal,
      )

      expect(createResponse.status).toBe(201)
      expect(typeof createResponse.body.updatedAt).toBe('string')
      const updatedAt = new Date(createResponse.body.updatedAt)
      expect(differenceInMilliseconds(new Date(), updatedAt)).toBeGreaterThan(0)
      expect(differenceInSeconds(new Date(), updatedAt)).toBeLessThan(2)
    })

    it('returns full transaction with uuid', async () => {
      const createResponse = await api.post(
        `/portfolios/${portfolioId}/transactions`,
        testTransactionFull,
      )

      expect(createResponse.status).toBe(201)
      expect(createResponse.body).toMatchObject(testTransactionFull)
      expect(typeof createResponse.body.uuid).toBe('string')
    })
  })

  describe('GET/PUT/DELETE .../transactions', () => {
    let minTransactionUuid: string
    let fullTransactionUuid: string

    beforeEach(async () => {
      minTransactionUuid = await api.createTransaction(
        portfolioId,
        testTransactionMinimal,
      )

      fullTransactionUuid = await api.createTransaction(
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
          uuid: minTransactionUuid,
        }),
      )
    })

    test('GET .../transactions contains full transaction', async () => {
      const response = await api.get(`/portfolios/${portfolioId}/transactions`)

      expect(response.status).toBe(200)
      expect(response.body).toContainEqual(
        expect.objectContaining({
          ...testTransactionFull,
          uuid: fullTransactionUuid,
          units: expect.arrayContaining(
            testTransactionFull.units.map((u) => expect.objectContaining(u)),
          ),
        }),
      )
    })

    test('GET .../transactions/$uuid returns minimal transaction', async () => {
      const response = await api.get(
        `/portfolios/${portfolioId}/transactions/${minTransactionUuid}`,
      )

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject(testTransactionMinimal)
    })

    test('GET .../transactions/$uuid returns full transaction', async () => {
      const response = await api.get(
        `/portfolios/${portfolioId}/transactions/${fullTransactionUuid}`,
      )

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject(testTransactionFull)
    })

    describe('PUT .../transactions/$uuid', () => {
      let otherSecurityUuid: string
      beforeAll(async () => {
        otherSecurityUuid = await api.createSecurity(portfolioId)
      })

      it.each(getObjectsWithMissingAttribute(testTransactionMinimal))(
        'fails if attribute %p is missing',
        async (missingAttribute, transaction) => {
          const response = await api.put(
            `/portfolios/${portfolioId}/transactions/${minTransactionUuid}`,
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
          `/portfolios/${portfolioId}/transactions/${minTransactionUuid}`,
          changedTransaction,
        )

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedTransaction)

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/transactions/${minTransactionUuid}`,
        )

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedTransaction)
      })

      it('updates account of transaction', async () => {
        const [
          otherAccountUuid,
        ] = await api.createTestDepositSecuritiesAccounts(portfolioId)

        const changedTransaction = {
          ...testTransactionMinimal,
          accountUuid: otherAccountUuid,
        }

        const updateResponse = await api.put(
          `/portfolios/${portfolioId}/transactions/${minTransactionUuid}`,
          changedTransaction,
        )

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedTransaction)

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/transactions/${minTransactionUuid}`,
        )

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedTransaction)
      })

      it('adds optional attributes to transaction', async () => {
        const changedTransaction = {
          ...testTransactionMinimal,
          shares: '5.55',
          portfolioSecurityUuid: otherSecurityUuid,
        }

        const updateResponse = await api.put(
          `/portfolios/${portfolioId}/transactions/${minTransactionUuid}`,
          changedTransaction,
        )

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedTransaction)

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/transactions/${minTransactionUuid}`,
        )

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedTransaction)
      })

      it('updates optional attributes of transaction', async () => {
        const changedTransaction = {
          ...testTransactionFull,
          shares: '11.22',
          portfolioSecurityUuid: otherSecurityUuid,
        }

        const updateResponse = await api.put(
          `/portfolios/${portfolioId}/transactions/${minTransactionUuid}`,
          changedTransaction,
        )

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedTransaction)

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/transactions/${minTransactionUuid}`,
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
          `/portfolios/${portfolioId}/transactions/${minTransactionUuid}`,
          changedTransaction,
        )

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedTransaction)

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/transactions/${minTransactionUuid}`,
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
          `/portfolios/${portfolioId}/transactions/${minTransactionUuid}`,
          changedTransaction,
        )

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedTransaction)

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/transactions/${minTransactionUuid}`,
        )

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedTransaction)
        expect(getResponse.body.units).toHaveLength(
          changedTransaction.units.length,
        )
      })

      it('does not update "uuid"', async () => {
        const updateResponse = await api.put(
          `/portfolios/${portfolioId}/transactions/${minTransactionUuid}`,
          {
            ...testTransactionMinimal,
            uuid: '11111111-1111-1111-1111-111111111111',
          },
        )

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body.uuid).toBe(minTransactionUuid)

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/transactions/${minTransactionUuid}`,
        )
        expect(getResponse.status).toBe(200)
      })

      it('sets updatedAt to current date/time (if not given)', async () => {
        const updateResponse = await api.put(
          `/portfolios/${portfolioId}/transactions/${fullTransactionUuid}`,
          testTransactionMinimal,
        )

        expect(updateResponse.status).toBe(200)
        expect(typeof updateResponse.body.updatedAt).toBe('string')
        const updatedAt = new Date(updateResponse.body.updatedAt)
        expect(differenceInMilliseconds(new Date(), updatedAt)).toBeGreaterThan(
          0,
        )
        expect(differenceInSeconds(new Date(), updatedAt)).toBeLessThan(2)
      })
    })

    test('DELETE .../transactions/$uuid removes transaction', async () => {
      const deleteResponse = await api.delete(
        `/portfolios/${portfolioId}/transactions/${minTransactionUuid}`,
      )

      expect(deleteResponse.status).toBe(200)
      expect(deleteResponse.body).toMatchObject(testTransactionMinimal)

      const getResponse = await api.get(
        `/portfolios/${portfolioId}/transactions/${minTransactionUuid}`,
      )

      expect(getResponse.status).toBe(404)
    })
  })
})
