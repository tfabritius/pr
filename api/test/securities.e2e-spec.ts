import { INestApplication } from '@nestjs/common'
import { differenceInMilliseconds, differenceInSeconds } from 'date-fns'

import { createApp } from '../src/app.factory'
import { ApiClient } from './api.client'
import { getObjectsWithMissingAttribute } from './utils'

describe('Securities (e2e)', () => {
  let app: INestApplication
  let api: ApiClient

  beforeAll(async () => {
    app = await createApp('test')
    await app.init()
    api = ApiClient.create(app.getHttpServer())
  }, 30000) // Timeout: 30s

  const user = { username: 'test-securities', password: 'testpassword' }

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

  const testSecurity = {
    name: 'Test security',
    note: 'comment',
    currencyCode: 'EUR',
    isin: 'some isin',
    wkn: 'some wkn',
    symbol: 'some symbol',
  }

  test('GET .../securities returns empty list', async () => {
    const response = await api.get(`/portfolios/${portfolioId}/securities`)

    expect(response.status).toBe(200)
    expect(response.body).toStrictEqual([])
  })

  describe('404s', () => {
    test.each([
      ['GET', '/securities'],
      ['GET', '/securities/11111111-1111-1111-1111-111111111111'],
      ['PUT', '/securities/11111111-1111-1111-1111-111111111111'],
      ['DELETE', '/securities/11111111-1111-1111-1111-111111111111'],
    ])(
      '%s /portfolios/42%s returns 404 Portfolio not found',
      async (method, url) => {
        const response = await api[method.toLowerCase()](`/portfolios/42${url}`)
        expect(response.status).toBe(404)
        expect(response.body.message).toContain('Portfolio not found')
      },
    )

    test.each([['GET'], ['DELETE']])(
      '%s .../securities/11111111-1111-1111-1111-111111111111 returns 404 Security not found',
      async (method) => {
        const response = await api[method.toLowerCase()](
          `/portfolios/${portfolioId}/securities/11111111-1111-1111-1111-111111111111`,
        )

        expect(response.status).toBe(404)
        expect(response.body.message).toContain('Security not found')
      },
    )
  })

  describe('POST .../securities', () => {
    it.each(
      getObjectsWithMissingAttribute(testSecurity, ['name', 'currencyCode']),
    )(
      `fails if attribute %p is missing`,
      async (missingAttribute, security) => {
        const response = await api.post(
          `/portfolios/${portfolioId}/securities`,
          security,
        )

        expect(response.status).toBe(400)
        expect(response.body.message).toContainEqual(
          expect.stringContaining(missingAttribute),
        )
      },
    )

    test('returns security with uuid', async () => {
      const createResponse = await api.post(
        `/portfolios/${portfolioId}/securities`,
        testSecurity,
      )

      expect(createResponse.status).toBe(201)
      expect(createResponse.body).toMatchObject(testSecurity)
      expect(typeof createResponse.body.uuid).toBe('string')
    })

    it('sets updatedAt to current date/time (if not given)', async () => {
      const createResponse = await api.post(
        `/portfolios/${portfolioId}/securities`,
        testSecurity,
      )

      expect(createResponse.status).toBe(201)
      expect(typeof createResponse.body.updatedAt).toBe('string')
      const updatedAt = new Date(createResponse.body.updatedAt)
      expect(differenceInMilliseconds(new Date(), updatedAt)).toBeGreaterThan(0)
      expect(differenceInSeconds(new Date(), updatedAt)).toBeLessThan(2)
    })
  })

  describe('GET/PUT/DELETE .../securities', () => {
    let securityUuid: string

    beforeEach(async () => {
      securityUuid = await api.createSecurity(portfolioId, testSecurity)
    })

    test('GET .../securities contains security', async () => {
      const response = await api.get(`/portfolios/${portfolioId}/securities`)
      expect(response.status).toBe(200)
      expect(response.body).toContainEqual(
        expect.objectContaining({
          ...testSecurity,
          uuid: securityUuid,
        }),
      )
    })

    test('GET .../securities/$uuid returns security', async () => {
      const response = await api.get(
        `/portfolios/${portfolioId}/securities/${securityUuid}`,
      )

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject(testSecurity)
    })

    describe('PUT .../securities/$uuid', () => {
      it.each(
        getObjectsWithMissingAttribute(testSecurity, ['name', 'currencyCode']),
      )(
        'fails if attribute %p is missing',
        async (missingAttribute, security) => {
          const response = await api.put(
            `/portfolios/${portfolioId}/securities/${securityUuid}`,
            security,
          )

          expect(response.status).toBe(400)
          expect(response.body.message).toContainEqual(
            expect.stringContaining(missingAttribute),
          )
        },
      )

      it('updates the security', async () => {
        const changedSecurity = {
          name: 'changed security',
          note: 'different note',
          currencyCode: 'CHF',
          isin: 'another isin',
          wkn: 'another wkn',
          symbol: 'another symbol',
        }

        const updateResponse = await api.put(
          `/portfolios/${portfolioId}/securities/${securityUuid}`,
          changedSecurity,
        )

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedSecurity)

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/securities/${securityUuid}`,
        )

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedSecurity)
      })

      it('does not update "uuid"', async () => {
        const updateResponse = await api.put(
          `/portfolios/${portfolioId}/securities/${securityUuid}`,
          {
            ...testSecurity,
            uuid: '22222222-2222-2222-2222-222222222222',
          },
        )

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body.uuid).toBe(securityUuid)

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/securities/${securityUuid}`,
        )
        expect(getResponse.status).toBe(200)
      })

      it('sets updatedAt to current date/time (if not given)', async () => {
        const updateResponse = await api.put(
          `/portfolios/${portfolioId}/securities/${securityUuid}`,
          testSecurity,
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

    test('DELETE .../securities/$uuid removes security', async () => {
      const deleteResponse = await api.delete(
        `/portfolios/${portfolioId}/securities/${securityUuid}`,
      )

      expect(deleteResponse.status).toBe(200)
      expect(deleteResponse.body).toMatchObject(testSecurity)

      const getResponse = await api.get(
        `/portfolios/${portfolioId}/securites/${securityUuid}`,
      )

      expect(getResponse.status).toBe(404)
    })

    test('DELETE .../securities/$uuid removes security and transactions', async () => {
      const [accountUuid] = await api.createTestDepositSecuritiesAccounts(
        portfolioId,
      )
      const transactionUuid = await api.createTransaction(portfolioId, {
        accountUuid,
        portfolioSecurityUuid: securityUuid,
        type: 'Payment',
        datetime: '2021-03-01T08:00:00.000Z',
        units: [],
      })

      const deleteResponse = await api.delete(
        `/portfolios/${portfolioId}/securities/${securityUuid}`,
      )
      expect(deleteResponse.status).toBe(200)

      const getResponse = await api.get(
        `/portfolios/${portfolioId}/transactions/${transactionUuid}`,
      )
      expect(getResponse.status).toBe(404)
    })
  })
})
