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

  const user = { username: 'test-accounts', password: 'testpassword' }

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

  const testDepositAccount = {
    type: 'deposit',
    name: 'Test deposit account',
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
      ['GET', '/accounts/11111111-1111-1111-1111-111111111111'],
      ['PUT', '/accounts/11111111-1111-1111-1111-111111111111'],
      ['DELETE', '/accounts/11111111-1111-1111-1111-111111111111'],
    ])(
      '%s /portfolios/42%s returns 404 Portfolio not found',
      async (method, url) => {
        const response = await api[method.toLowerCase()](`/portfolios/42${url}`)

        expect(response.status).toBe(404)
        expect(response.body.message).toContain('Portfolio not found')
      },
    )

    test.each([['GET'], ['DELETE']])(
      '%s .../accounts/11111111-1111-1111-1111-111111111111 returns 404 Account not found',
      async (method) => {
        const response = await api[method.toLowerCase()](
          `/portfolios/${portfolioId}/accounts/11111111-1111-1111-1111-111111111111`,
        )

        expect(response.status).toBe(404)
        expect(response.body.message).toContain('Account not found')
      },
    )
  })

  describe('Deposit account', () => {
    describe('POST .../accounts', () => {
      it.each(
        getObjectsWithMissingAttribute(testDepositAccount, [
          'type',
          'name',
          'currencyCode',
        ]),
      )(
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

      test('returns account with uuid', async () => {
        const createResponse = await api.post(
          `/portfolios/${portfolioId}/accounts`,
          testDepositAccount,
        )

        expect(createResponse.status).toBe(201)
        expect(createResponse.body).toMatchObject(testDepositAccount)
        expect(typeof createResponse.body.uuid).toBe('string')
      })
    })

    describe('GET/PUT/DELETE .../accounts', () => {
      let depositAccountUuid: string

      beforeEach(async () => {
        depositAccountUuid = await api.createAccount(
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
            uuid: depositAccountUuid,
          }),
        )
      })

      test('GET .../accounts/$uuid returns account', async () => {
        const response = await api.get(
          `/portfolios/${portfolioId}/accounts/${depositAccountUuid}`,
        )

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject(testDepositAccount)
      })

      describe('PUT .../accounts/$uuid', () => {
        it.each(
          getObjectsWithMissingAttribute(testDepositAccount, [
            'type',
            'name',
            'currencyCode',
          ]),
        )(
          'fails if attribute %p is missing',
          async (missingAttribute, account) => {
            const response = await api.put(
              `/portfolios/${portfolioId}/accounts/${depositAccountUuid}`,
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
            note: 'changed comment',
            currencyCode: 'USD',
          }

          const updateResponse = await api.put(
            `/portfolios/${portfolioId}/accounts/${depositAccountUuid}`,
            changedAccount,
          )

          expect(updateResponse.status).toBe(200)
          expect(updateResponse.body).toMatchObject(changedAccount)

          const getResponse = await api.get(
            `/portfolios/${portfolioId}/accounts/${depositAccountUuid}`,
          )

          expect(getResponse.status).toBe(200)
          expect(getResponse.body).toMatchObject(changedAccount)
        })

        it('does not update "uuid"', async () => {
          const updateResponse = await api.put(
            `/portfolios/${portfolioId}/accounts/${depositAccountUuid}`,
            {
              ...testDepositAccount,
              uuid: '22222222-2222-2222-2222-222222222222',
            },
          )

          expect(updateResponse.status).toBe(200)
          expect(updateResponse.body.uuid).toBe(depositAccountUuid)

          const getResponse = await api.get(
            `/portfolios/${portfolioId}/accounts/${depositAccountUuid}`,
          )
          expect(getResponse.status).toBe(200)
        })
      })

      test('DELETE .../accounts/$uuid removes account', async () => {
        const deleteResponse = await api.delete(
          `/portfolios/${portfolioId}/accounts/${depositAccountUuid}`,
        )

        expect(deleteResponse.status).toBe(200)
        expect(deleteResponse.body).toMatchObject(testDepositAccount)

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/accounts/${depositAccountUuid}`,
        )

        expect(getResponse.status).toBe(404)
      })
    })
  })

  describe('Securities account', () => {
    const testSecuritiesAccount = {
      type: 'securities',
      name: 'Test securities account',
      note: 'comment',
      referenceAccountUuid: undefined,
    }

    let depositAccountUuid: string

    beforeAll(async () => {
      depositAccountUuid = await api.createAccount(
        portfolioId,
        testDepositAccount,
      )

      testSecuritiesAccount.referenceAccountUuid = depositAccountUuid
    })

    describe('POST .../accounts', () => {
      it.each(
        getObjectsWithMissingAttribute(testSecuritiesAccount, [
          'type',
          'name',
          'referenceAccountUuid',
        ]),
      )(
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

      it('returns account with uuid', async () => {
        const response = await api.post(
          `/portfolios/${portfolioId}/accounts`,
          testSecuritiesAccount,
        )

        expect(response.status).toBe(201)
        expect(response.body).toMatchObject(testSecuritiesAccount)
        expect(typeof response.body.uuid).toBe('string')
      })
    })

    describe('GET/PUT/DELETE .../accounts', () => {
      let securitiesAccountUuid: string

      beforeEach(async () => {
        securitiesAccountUuid = await api.createAccount(
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
            uuid: securitiesAccountUuid,
          }),
        )
      })

      test('GET .../accounts/$uuid returns account', async () => {
        const response = await api.get(
          `/portfolios/${portfolioId}/accounts/${securitiesAccountUuid}`,
        )

        expect(response.status).toBe(200)
        expect(response.body).toMatchObject(testSecuritiesAccount)
      })

      describe('PUT .../accounts/$uuid', () => {
        it.each(
          getObjectsWithMissingAttribute(testSecuritiesAccount, [
            'type',
            'name',
            'referenceAccountUuid',
          ]),
        )(
          'fails if attribute %p is missing',
          async (missingAttribute, account) => {
            const response = await api.put(
              `/portfolios/${portfolioId}/accounts/${securitiesAccountUuid}`,
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
            note: 'changed comment',
            referenceAccountUuid: depositAccountUuid,
          }

          const updateResponse = await api.put(
            `/portfolios/${portfolioId}/accounts/${securitiesAccountUuid}`,
            changedAccount,
          )

          expect(updateResponse.status).toBe(200)
          expect(updateResponse.body).toMatchObject(changedAccount)

          const getResponse = await api.get(
            `/portfolios/${portfolioId}/accounts/${securitiesAccountUuid}`,
          )

          expect(getResponse.status).toBe(200)
          expect(getResponse.body).toMatchObject(changedAccount)
        })

        it('updates referenceAccount of account', async () => {
          const secondDepositAccountUuid: string = await api.createAccount(
            portfolioId,
            testDepositAccount,
          )

          const changedAccount = {
            ...testSecuritiesAccount,
            referenceAccountUuid: secondDepositAccountUuid,
          }

          const updateResponse = await api.put(
            `/portfolios/${portfolioId}/accounts/${securitiesAccountUuid}`,
            changedAccount,
          )

          expect(updateResponse.status).toBe(200)
          expect(updateResponse.body).toMatchObject(changedAccount)

          const getResponse = await api.get(
            `/portfolios/${portfolioId}/accounts/${securitiesAccountUuid}`,
          )

          expect(getResponse.status).toBe(200)
          expect(getResponse.body).toMatchObject(changedAccount)
        })

        it('fails if referenceAccount does not exist', async () => {
          const changedAccount = {
            ...testSecuritiesAccount,
            referenceAccountUuid: '11111111-1111-1111-1111-111111111111',
          }

          const response = await api.put(
            `/portfolios/${portfolioId}/accounts/${securitiesAccountUuid}`,
            changedAccount,
          )

          expect(response.status).toBe(400)
          expect(response.body.message).toMatch('referenceAccount')
        })
      })

      test('DELETE .../accounts/$uuid removes account', async () => {
        const deleteResponse = await api.delete(
          `/portfolios/${portfolioId}/accounts/${securitiesAccountUuid}`,
        )

        expect(deleteResponse.status).toBe(200)
        expect(deleteResponse.body).toMatchObject(testSecuritiesAccount)

        const getResponse = await api.get(
          `/portfolios/${portfolioId}/accounts/${securitiesAccountUuid}`,
        )

        expect(getResponse.status).toBe(404)
      })
    })
  })
})
