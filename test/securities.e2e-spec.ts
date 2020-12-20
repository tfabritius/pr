import { INestApplication } from '@nestjs/common'

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
    uuid: '11111111-1111-1111-1111-111111111111',
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
      ['GET', '/securities/42'],
      ['PUT', '/securities/42'],
      ['DELETE', '/securities/42'],
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
      ['PUT', testSecurity],
      ['DELETE', undefined],
    ])(
      '%s .../securities/42 returns 404 Security not found',
      async (method, payload) => {
        const args: any[] = [`/portfolios/${portfolioId}/securities/42`]
        if (payload) {
          args.push(payload)
        }
        const response = await api[method.toLowerCase()](...args)

        expect(response.status).toBe(404)
        expect(response.body.message).toContain('Security not found')
      },
    )
  })

  describe('POST .../securities', () => {
    it.each(getObjectsWithMissingAttribute(testSecurity))(
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

    test('returns security with id', async () => {
      const createResponse = await api.post(
        `/portfolios/${portfolioId}/securities`,
        testSecurity,
      )

      expect(createResponse.status).toBe(201)
      expect(createResponse.body).toMatchObject(testSecurity)
      expect(typeof createResponse.body.id).toBe('number')
    })
  })

  describe('GET/PUT/DELETE .../securities', () => {
    let securityId: number

    beforeEach(async () => {
      securityId = await api.createSecurity(portfolioId, testSecurity)
    })

    test('GET .../securities contains security', async () => {
      const response = await api.get(`/portfolios/${portfolioId}/securities`)
      expect(response.status).toBe(200)
      expect(response.body).toContainEqual(
        expect.objectContaining({
          ...testSecurity,
          id: securityId,
        }),
      )
    })

    test('GET .../securities/$id returns security', async () => {
      const response = await api.get(
        `/portfolios/${portfolioId}/securities/${securityId}`,
      )

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject(testSecurity)
    })

    describe('PUT .../securities/$id', () => {
      it.each(getObjectsWithMissingAttribute(testSecurity))(
        'fails if attribute %p is missing',
        async (missingAttribute, security) => {
          const response = await api.put(
            `/portfolios/${portfolioId}/securities/${securityId}`,
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
          uuid: '22222222-2222-2222-2222-222222222222',
          note: 'different note',
          currencyCode: 'CHF',
          isin: 'another isin',
          wkn: 'another wkn',
          symbol: 'another symbol',
        }

        const updateResponse = await api.put(
          `/portfolios/${portfolioId}/securities/${securityId}`,
          changedSecurity,
        )

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body).toMatchObject(changedSecurity)

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/securities/${securityId}`,
        )

        expect(getResponse.status).toBe(200)
        expect(getResponse.body).toMatchObject(changedSecurity)
      })

      it('does not update "id"', async () => {
        const updateResponse = await api.put(
          `/portfolios/${portfolioId}/securities/${securityId}`,
          {
            ...testSecurity,
            id: securityId + 666,
          },
        )

        expect(updateResponse.status).toBe(200)
        expect(updateResponse.body.id).toBe(securityId)

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/securities/${securityId}`,
        )
        expect(getResponse.status).toBe(200)
      })
    })

    test('DELETE .../securities/$id removes security', async () => {
      const deleteResponse = await api.delete(
        `/portfolios/${portfolioId}/securities/${securityId}`,
      )

      expect(deleteResponse.status).toBe(204)
      expect(deleteResponse.body).toStrictEqual({})

      const getResponse = await api.get(
        `/portfolios/${portfolioId}/securites/${securityId}`,
      )

      expect(getResponse.status).toBe(404)
    })
  })
})
