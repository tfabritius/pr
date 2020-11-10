import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'

import { createApp } from '../src/app.factory'

describe('Security (e2e)', () => {
  let app: INestApplication
  let http: any

  beforeAll(async () => {
    app = await createApp('test')
    await app.init()
    http = app.getHttpServer()
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
    ]

    test.each(endpoints)(
      '%p %p fails without session token',
      async (method, url) => {
        const response = await request(http)[method](url)
        expect(response.status).toBe(401)
      },
    )

    test.each(endpoints)(
      '%p %p fails with invalid session token',
      async (method, url) => {
        const response = await request(http)
          [method](url)
          .set('Authorization', 'bearer non-existent')
        expect(response.status).toBe(401)
      },
    )
  })
})
