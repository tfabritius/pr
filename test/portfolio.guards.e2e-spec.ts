import { INestApplication } from '@nestjs/common'

import { createApp } from '../src/app.factory'
import { ApiClient } from './api.client'

describe('Portfolio Guards (e2e)', () => {
  let app: INestApplication
  let api: ApiClient
  let apiOne: ApiClient
  let apiTwo: ApiClient

  beforeAll(async () => {
    app = await createApp('test')
    await app.init()
    api = ApiClient.create(app.getHttpServer())
  })

  beforeAll(async () => {
    const user1 = {
      username: 'test-portfolio-guards1',
      password: 'testpassword',
    }
    const user2 = {
      username: 'test-portfolio-guards2',
      password: 'testpassword',
    }

    await api.cleanUser(user1, false)
    await api.cleanUser(user2, false)
    ;[apiOne] = await api.register(user1)
    ;[apiTwo] = await api.register(user2)
  })

  let portfolioOne: number
  let portfolioTwo: number

  beforeAll(async () => {
    portfolioOne = await apiOne.createPortfolio()
    portfolioTwo = await apiTwo.createPortfolio()
  })

  describe('Portfolio', () => {
    test('GET /portfolios does not list foreign portfolios', async () => {
      const response = await apiTwo.get('/portfolios')
      expect(response.status).toBe(200)
      expect(response.body).toContainEqual(
        expect.objectContaining({ id: portfolioTwo }),
      )
      expect(response.body).not.toContainEqual(
        expect.objectContaining({ id: portfolioOne }),
      )
    })

    test.each(['GET', 'PUT', 'DELETE'])(
      '%s foreign portfolio returns 404',
      async (method) => {
        const response = await apiTwo[method.toLowerCase()](
          `/portfolios/${portfolioOne}`,
        )
        expect(response.status).toBe(404)
      },
    )
  })

  describe('Objects within portfolio', () => {
    let accountOne: number
    let accountTwo: number
    let securityOne: number
    let securityTwo: number
    let transactionOne: number
    let transactionTwo: number

    let urls = []

    beforeAll(async () => {
      ;[accountOne] = await apiOne.createTestDepositSecuritiesAccounts(
        portfolioOne,
      )
      ;[, accountTwo] = await apiTwo.createTestDepositSecuritiesAccounts(
        portfolioTwo,
      )
      securityOne = await apiOne.createSecurity(portfolioOne)
      securityTwo = await apiTwo.createSecurity(portfolioTwo)
      transactionOne = await apiOne.createTransaction(portfolioOne, {
        type: 'Payment',
        account: { id: accountOne },
        datetime: '2020-01-01T00:00:00.000Z',
        units: [],
        note: '',
      })
      transactionTwo = await apiTwo.createTransaction(portfolioTwo, {
        type: 'Payment',
        account: { id: accountTwo },
        datetime: '2020-01-01T00:00:00.000Z',
        units: [],
        note: '',
        security: { id: securityTwo },
      })

      urls = [
        `/accounts/${accountOne}`,
        `/securities/${securityOne}`,
        `/transactions/${transactionOne}`,
      ]
    })

    describe.each([['GET'], ['PUT'], ['DELETE']])(
      '%s foreign object',
      (method) => {
        test('via foreign portfolio returns 404', async () => {
          for (const url of urls) {
            const response = await apiTwo[method.toLowerCase()](
              `/portfolios/${portfolioOne}${url}`,
            )
            expect(response.status).toBe(404)
          }
        })

        test('via own portfolio returns 404', async () => {
          for (const url of urls) {
            const response = await apiTwo[method.toLowerCase()](
              `/portfolios/${portfolioTwo}/${url}`,
            )
            expect(response.status).toBe(404)
          }
        })
      },
    )

    describe('References across users', () => {
      test('Creating account with referenceAccount in foreign portfolio fails', async () => {
        const response = await apiTwo.post(
          `/portfolios/${portfolioTwo}/accounts`,
          {
            type: 'securities',
            name: '...',
            uuid: '',
            note: '',
            referenceAccount: { id: accountOne },
          },
        )
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('referenceAccount not found')
      })

      test('Updating account with referenceAccount in foreign portfolio fails', async () => {
        const response = await apiTwo.put(
          `/portfolios/${portfolioTwo}/accounts/${accountTwo}`,
          {
            type: 'securities',
            name: '...',
            uuid: '',
            note: '',
            referenceAccount: { id: accountOne },
          },
        )
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('referenceAccount not found')
      })

      test('Creating transaction with account in foreign portfolio fails', async () => {
        const response = await apiTwo.post(
          `/portfolios/${portfolioTwo}/transactions`,
          {
            type: 'Payment',
            account: { id: accountOne },
            datetime: '2020-01-01T00:00:00.000Z',
            units: [],
            note: '',
          },
        )
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Account not found')
      })

      test('Updating transaction with account in foreign portfolio fails', async () => {
        const response = await apiTwo.put(
          `/portfolios/${portfolioTwo}/transactions/${transactionTwo}`,
          {
            type: 'Payment',
            account: { id: accountOne },
            datetime: '2020-01-01T00:00:00.000Z',
            units: [],
            note: '',
          },
        )
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Account not found')
      })

      test('Creating transaction with security in foreign portfolio fails', async () => {
        const response = await apiTwo.post(
          `/portfolios/${portfolioTwo}/transactions`,
          {
            type: 'Payment',
            account: { id: accountTwo },
            datetime: '2020-01-01T00:00:00.000Z',
            units: [],
            note: '',
            security: { id: securityOne },
          },
        )
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Security not found')
      })

      test('Updating transaction with security in foreign portfolio fails', async () => {
        const response = await apiTwo.put(
          `/portfolios/${portfolioTwo}/transactions/${transactionTwo}`,
          {
            type: 'Payment',
            account: { id: accountTwo },
            datetime: '2020-01-01T00:00:00.000Z',
            units: [],
            note: '',
            security: { id: securityOne },
          },
        )
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Security not found')
      })
    })
  })

  afterAll(async () => {
    await app.close()
  })
})
