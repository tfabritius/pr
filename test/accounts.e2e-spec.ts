import { INestApplication } from '@nestjs/common'

import { createApp } from '../src/app.factory'
import { ApiClient } from './api.client'
import { getObjectsWithMissingAttribute } from './utils'

describe('Accounts (e2e)', () => {
  let app: INestApplication
  let api: ApiClient

  beforeAll(async () => {
    app = await createApp('test')
    await app.init()
    api = ApiClient.create(app.getHttpServer())
  }, 30000) // Timeout: 30s

  afterAll(async () => {
    await app.close()
  })

  const user = { username: 'test-accounts', password: 'testpassword' }

  beforeAll(async () => {
    await api.cleanUser(user, false)
    ;[api] = await api.register(user)
  })

  let portfolioId: number

  beforeAll(async () => {
    portfolioId = await api.createPortfolio()
  })

  const testDepositAccount = {
    type: 'deposit',
    name: 'Test deposit account',
    uuid: '42',
    note: 'comment',
    currencyCode: 'EUR',
  }

  test('GET .../accounts returns empty list', async () => {
    const response = await api.get(`/portfolios/${portfolioId}/accounts`)

    expect(response.status).toBe(200)
    expect(response.body).toStrictEqual([])
  })

  describe('404s', () => {
    test.each([
      ['GET', '/accounts'],
      ['GET', '/accounts/42'],
      ['PUT', '/accounts/42'],
      ['DELETE', '/accounts/42'],
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
      ['PUT', testDepositAccount],
      ['DELETE', undefined],
    ])(
      '%s .../accounts/42 returns 404 Account not found',
      async (method, payload) => {
        const args: any[] = [`/portfolios/${portfolioId}/accounts/42`]
        if (payload) {
          args.push(payload)
        }
        const response = await api[method.toLowerCase()](...args)

        expect(response.status).toBe(404)
        expect(response.body.message).toContain('Account not found')
      },
    )
  })

  describe('Deposit account', () => {
    describe('POST .../accounts', () => {
      it.each(getObjectsWithMissingAttribute(testDepositAccount))(
        `fails if attribute %p is missing`,
        async (missingAttribute, account) => {
          const response = await api.post(
            `/portfolios/${portfolioId}/accounts`,
            account,
          )

          expect(response.status).toBe(400)
          expect(response.body.message).toContainEqual(
            expect.stringContaining(missingAttribute),
          )
        },
      )

      test('returns account with id', async () => {
        const createResponse = await api.post(
          `/portfolios/${portfolioId}/accounts`,
          testDepositAccount,
        )

        expect(createResponse.status).toBe(201)
        expect(createResponse.body).toMatchObject(testDepositAccount)
        expect(typeof createResponse.body.id).toBe('number')
      })
    })

    describe('GET/PUT/DELETE .../accounts', () => {
      let depositAccountId: number

      beforeEach(async () => {
        depositAccountId = await api.createAccount(
          portfolioId,
          testDepositAccount,
        )
      })

      test('GET .../accounts contains account', async () => {
        const response = await api.get(`/portfolios/${portfolioId}/accounts`)

        expect(response.status).toBe(200)
        expect(response.body).toContainEqual(
          expect.objectContaining({
            ...testDepositAccount,
            id: depositAccountId,
          }),
        )
      })

      test('GET .../accounts/$id returns account', async () => {
        const response = await api.get(
          `/portfolios/${portfolioId}/accounts/${depositAccountId}`,
        )

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject(testDepositAccount)
      })

      describe('PUT .../accounts/$id', () => {
        it.each(getObjectsWithMissingAttribute(testDepositAccount))(
          'fails if attribute %p is missing',
          async (missingAttribute, account) => {
            const response = await api.put(
              `/portfolios/${portfolioId}/accounts/${depositAccountId}`,
              account,
            )

            expect(response.status).toBe(400)
            expect(response.body.message).toContainEqual(
              expect.stringContaining(missingAttribute),
            )
          },
        )

        it('updates the account', async () => {
          const changedAccount = {
            type: 'deposit',
            name: 'changed name',
            uuid: '',
            note: 'changed comment',
            currencyCode: 'USD',
          }

          const updateResponse = await api.put(
            `/portfolios/${portfolioId}/accounts/${depositAccountId}`,
            changedAccount,
          )

          expect(updateResponse.status).toBe(200)
          expect(updateResponse.body).toMatchObject(changedAccount)

          const getResponse = await api.get(
            `/portfolios/${portfolioId}/accounts/${depositAccountId}`,
          )

          expect(getResponse.status).toBe(200)
          expect(getResponse.body).toMatchObject(changedAccount)
        })
      })

      test('DELETE .../accounts/$id removes account', async () => {
        const deleteResponse = await api.delete(
          `/portfolios/${portfolioId}/accounts/${depositAccountId}`,
        )

        expect(deleteResponse.status).toBe(204)
        expect(deleteResponse.body).toStrictEqual({})

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/accounts/${depositAccountId}`,
        )

        expect(getResponse.status).toBe(404)
      })
    })
  })

  describe('Securities account', () => {
    const testSecuritiesAccount = {
      type: 'securities',
      name: 'Test securities account',
      uuid: '42',
      note: 'comment',
      referenceAccount: undefined,
    }

    let depositAccountId: number

    beforeAll(async () => {
      depositAccountId = await api.createAccount(
        portfolioId,
        testDepositAccount,
      )

      testSecuritiesAccount.referenceAccount = { id: depositAccountId }
    })

    describe('POST .../accounts', () => {
      it.each(getObjectsWithMissingAttribute(testSecuritiesAccount))(
        `fails if attribute %p is missing`,
        async (missingAttribute, account) => {
          const response = await api.post(
            `/portfolios/${portfolioId}/accounts`,
            account,
          )

          expect(response.status).toBe(400)
          expect(response.body.message).toContainEqual(
            expect.stringContaining(missingAttribute),
          )
        },
      )

      it('returns account with id', async () => {
        const response = await api.post(
          `/portfolios/${portfolioId}/accounts`,
          testSecuritiesAccount,
        )

        expect(response.status).toBe(201)
        expect(response.body).toMatchObject(testSecuritiesAccount)
        expect(typeof response.body.id).toBe('number')
      })
    })

    describe('GET/PUT/DELETE .../accounts', () => {
      let securitiesAccountId: number

      beforeEach(async () => {
        securitiesAccountId = await api.createAccount(
          portfolioId,
          testSecuritiesAccount,
        )
      })

      test('GET .../accounts contains account', async () => {
        const response = await api.get(`/portfolios/${portfolioId}/accounts`)

        expect(response.status).toBe(200)
        expect(response.body).toContainEqual(
          expect.objectContaining({
            ...testSecuritiesAccount,
            id: securitiesAccountId,
            referenceAccount: expect.objectContaining({
              ...testDepositAccount,
              id: depositAccountId,
            }),
          }),
        )
      })

      test('GET .../accounts/$id returns account', async () => {
        const response = await api.get(
          `/portfolios/${portfolioId}/accounts/${securitiesAccountId}`,
        )

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject(testSecuritiesAccount)
        expect(response.body.referenceAccount).toMatchObject(testDepositAccount)
      })

      describe('PUT .../accounts/$id', () => {
        it.each(getObjectsWithMissingAttribute(testSecuritiesAccount))(
          'fails if attribute %p is missing',
          async (missingAttribute, account) => {
            const response = await api.put(
              `/portfolios/${portfolioId}/accounts/${securitiesAccountId}`,
              account,
            )

            expect(response.status).toBe(400)
            expect(response.body.message).toContainEqual(
              expect.stringContaining(missingAttribute),
            )
          },
        )
        it('updates attributes of account', async () => {
          const changedAccount = {
            type: 'securities',
            name: 'changed name',
            uuid: '',
            note: 'changed comment',
            referenceAccount: { id: depositAccountId },
          }

          const updateResponse = await api.put(
            `/portfolios/${portfolioId}/accounts/${securitiesAccountId}`,
            changedAccount,
          )

          expect(updateResponse.status).toBe(200)
          expect(updateResponse.body).toMatchObject(changedAccount)

          const getResponse = await api.get(
            `/portfolios/${portfolioId}/accounts/${securitiesAccountId}`,
          )

          expect(getResponse.status).toBe(200)
          expect(getResponse.body).toMatchObject(changedAccount)
        })

        it('updates referenceAccount of account', async () => {
          const secondDepositAccountId = await api.createAccount(
            portfolioId,
            testDepositAccount,
          )

          const changedAccount = {
            ...testSecuritiesAccount,
            referenceAccount: { id: secondDepositAccountId },
          }

          const updateResponse = await api.put(
            `/portfolios/${portfolioId}/accounts/${securitiesAccountId}`,
            changedAccount,
          )

          expect(updateResponse.status).toBe(200)
          expect(updateResponse.body).toMatchObject(changedAccount)

          const getResponse = await api.get(
            `/portfolios/${portfolioId}/accounts/${securitiesAccountId}`,
          )

          expect(getResponse.status).toBe(200)
          expect(getResponse.body).toMatchObject(changedAccount)
        })

        it('fails if referenceAccount does not exist', async () => {
          const changedAccount = {
            ...testSecuritiesAccount,
            referenceAccount: { id: -1 },
          }

          const response = await api.put(
            `/portfolios/${portfolioId}/accounts/${securitiesAccountId}`,
            changedAccount,
          )

          expect(response.status).toBe(400)
          expect(response.body.message).toMatch('referenceAccount')
        })
      })

      test('DELETE .../accounts/$id removes account', async () => {
        const deleteResponse = await api.delete(
          `/portfolios/${portfolioId}/accounts/${securitiesAccountId}`,
        )

        expect(deleteResponse.status).toBe(204)
        expect(deleteResponse.body).toStrictEqual({})

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/accounts/${securitiesAccountId}`,
        )

        expect(getResponse.status).toBe(404)
      })
    })
  })
})
