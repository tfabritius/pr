import { INestApplication } from '@nestjs/common'

import { createApp } from '../src/app.factory'
import { ApiClient } from './api.client'

describe('Guards (e2e)', () => {
  let app: INestApplication
  let api: ApiClient

  beforeAll(async () => {
    app = await createApp('test')
    await app.init()
    api = ApiClient.create(app.getHttpServer())
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Endpoints require session token', () => {
    const endpoints = [
      ['post', '/auth/logout'],
      ['get', '/auth/sessions'],
      ['get', '/auth/users/me'],
      ['post', '/auth/users/me/password'],
      ['delete', '/auth/users/me'],
      ['post', '/portfolios'],
      ['get', '/portfolios'],
      ['get', '/portfolios/42'],
      ['put', '/portfolios/42'],
      ['delete', '/portfolios/42'],
      ['post', '/portfolios/42/accounts'],
      ['get', '/portfolios/42/accounts'],
      ['get', '/portfolios/42/accounts/42'],
      ['put', '/portfolios/42/accounts/42'],
      ['delete', '/portfolios/42/accounts/42'],
      ['post', '/portfolios/42/transactions'],
      ['get', '/portfolios/42/transactions'],
      ['get', '/portfolios/42/transactions/42'],
      ['put', '/portfolios/42/transactions/42'],
      ['delete', '/portfolios/42/transactions/42'],
      ['post', '/portfolios/42/securities'],
      ['get', '/portfolios/42/securities'],
      ['get', '/portfolios/42/securities/42'],
      ['put', '/portfolios/42/securities/42'],
      ['delete', '/portfolios/42/securities/42'],
    ]

    test.each(endpoints)(
      '%s %s fails without session token',
      async (method, url) => {
        const response = await api[method](url)
        expect(response.status).toBe(401)
      },
    )

    test.each(endpoints)(
      '%s %s fails with invalid session token',
      async (method, url) => {
        const response = await api.session('non-existent')[method](url)
        expect(response.status).toBe(401)
      },
    )
  })
})
