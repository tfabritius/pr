import { INestApplication } from '@nestjs/common'

import { createApp } from '../src/app.factory'
import { ApiClient } from './api.client'

describe('Authentication (e2e)', () => {
  let app: INestApplication
  let api: ApiClient

  const user = { username: 'TestUser', password: 'testpassword' }

  beforeAll(async () => {
    app = await createApp('test')
    await app.init()
    api = ApiClient.create(app.getHttpServer())
  }, 30000) // Timeout: 30s

  afterAll(async () => {
    await app.close()
  })

  describe('/auth/register', () => {
    beforeAll(async () => {
      await api.cleanUser(user, false)
    })

    describe('successful registration', () => {
      let registerResponse

      beforeAll(async () => {
        registerResponse = await api.post('/auth/register', user)
      })

      it('returns session token', () => {
        expect(registerResponse.status).toBe(201)
        expect(typeof registerResponse.body.token).toBe('string')
      })

      it('does not return user information', () => {
        expect(registerResponse.body.user).toBeUndefined()
      })

      it('returns valid session token', async () => {
        const response = await api
          .session(registerResponse.body.token)
          .get('/auth/users/me')

        expect(response.status).toBe(200)
      })

      it('converts username to lowercase', async () => {
        const response = await api
          .session(registerResponse.body.token)
          .get('/auth/users/me')

        expect(response.body.username).toBe(user.username.toLowerCase())

        // Make sure we are not testing with lowercase username only
        expect(response.body.username).not.toBe(user.username)
      })

      it('fails to register same user again', async () => {
        const response = await api.post('/auth/register', user)
        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Username is already in use.')
      })
    })

    describe('failed registrations', () => {
      it('fails without username', async () => {
        const response = await api.post('/auth/register', {
          password: 'testpassword',
        })

        expect(response.status).toBe(400)
        expect(response.body.message).toContain('Username is missing')
      })

      it('fails with empty username', async () => {
        const response = await api.post('/auth/register', {
          user: '',
          password: 'testpassword',
        })

        expect(response.status).toBe(400)
        expect(response.body.message).toContain('Username is missing')
      })

      it('fails without password', async () => {
        const response = await api.post('/auth/register', {
          username: 'randomuser',
        })

        expect(response.status).toBe(400)
        expect(response.body.message).toContain('Password is missing')
      })

      it('fails with empty password', async () => {
        const response = await api.post('/auth/register', {
          username: 'randomuser',
          password: '',
        })

        expect(response.status).toBe(400)
        expect(response.body.message).toContainEqual(
          expect.stringContaining('Password is too short'),
        )
      })
    })

    afterAll(async () => {
      await api.cleanUser(user)
    })
  })

  describe('with registered user', () => {
    let authApi: ApiClient
    let registerResponse

    beforeAll(async () => {
      ;[authApi, registerResponse] = await api.register(user)
    })

    afterAll(async () => {
      await api.cleanUser(user)
    })

    describe('/auth/login', () => {
      describe('successful login', () => {
        let loginResponse

        beforeAll(async () => {
          loginResponse = await api.post('/auth/login', user)
        })

        it('returns session token', () => {
          expect(loginResponse.status).toBe(201)
          expect(typeof loginResponse.body.token).toBe('string')
        })

        it('returns valid session token', async () => {
          const response = await api
            .session(loginResponse.body.token)
            .get('/auth/users/me')

          expect(response.status).toBe(200)
        })

        it('does not return user information', () => {
          expect(loginResponse.body.user).toBeUndefined()
        })

        it('converts username to lowercase', async () => {
          const response = await api
            .session(loginResponse.body.token)
            .get('/auth/users/me')

          expect(response.body.username).toBe(user.username.toLowerCase())

          // Make sure we are not testing with lowercase username only
          expect(response.body.username).not.toBe(user.username)
        })
      })

      describe('failed logins', () => {
        it('fails without password', async () => {
          const response = await api.post('/auth/login', {
            username: user.username,
          })

          expect(response.status).toBe(401)
        })

        it('fails with wrong password', async () => {
          const response = await api.post('/auth/login', {
            username: user.username,
            password: 'wrong',
          })

          expect(response.status).toBe(401)
        })
      })
    })

    describe('/auth/logout', () => {
      describe('successful logout', () => {
        let logoutResponse
        let sessionApi: ApiClient

        beforeAll(async () => {
          ;[sessionApi] = await api.login(user)
          logoutResponse = await sessionApi.post('/auth/logout')
        })

        it('returns nothing', () => {
          expect(logoutResponse.status).toBe(204)
          expect(logoutResponse.body).toStrictEqual({})
        })

        it('invalidates session token', async () => {
          const response = await sessionApi.get('/auth/users/me')
          expect(response.status).toBe(401)
        })
      })
    })

    describe('/auth/sessions', () => {
      it('returns list of sessions', async () => {
        const response = await authApi.get('/auth/sessions')

        expect(response.status).toBe(200)
        expect(response.body).toContainEqual(
          expect.objectContaining({
            token: registerResponse.body.token,
          }),
        )
      })
    })

    describe('/auth/users', () => {
      describe('GET ../me', () => {
        it('returns user information', async () => {
          const response = await authApi.get('/auth/users/me')

          expect(response.status).toBe(200)
          expect(response.body.username).toBe(user.username.toLowerCase())
          expect(response.body.lastSeenAt).toBe(
            new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z',
          )
        })
      })
    })
  })

  describe('POST /auth/users/me/password', () => {
    let authApi: ApiClient

    beforeAll(async () => {
      ;[authApi] = await api.register(user)
    })

    afterAll(async () => {
      // Password might be changed after tests
      const response = await authApi.delete('/auth/users/me')
      expect(response.status).toBe(204)
    })

    it('fails if old password is wrong', async () => {
      const response = await authApi.post('/auth/users/me/password', {
        oldPassword: 'wrong',
        newPassword: 'newPassword',
      })

      expect(response.status).toBe(403)
    })

    describe('successful change', () => {
      let changeResponse

      beforeAll(async () => {
        changeResponse = await authApi.post('/auth/users/me/password', {
          oldPassword: user.password,
          newPassword: 'newPassword',
        })
      })

      it('returns nothing', () => {
        expect(changeResponse.status).toBe(201)
        expect(changeResponse.body).toStrictEqual({})
      })

      it('prevents login with old password', async () => {
        const response = await api.post('/auth/login', user)
        expect(response.status).toBe(401)
      })

      it('allows login with new password', async () => {
        const response = await api.post('/auth/login', {
          username: user.username,
          password: 'newPassword',
        })
        expect(response.status).toBe(201)
      })
    })
  })

  describe('DELETE /auth/users/me', () => {
    let authApi: ApiClient
    let deleteResponse

    beforeAll(async () => {
      ;[authApi] = await api.register(user)
      deleteResponse = await authApi.delete('/auth/users/me')
    })

    it('returns nothing', () => {
      expect(deleteResponse.status).toBe(204)
      expect(deleteResponse.body).toStrictEqual({})
    })

    it('removes the session', async () => {
      const response = await authApi.get('/auth/users/me')

      expect(response.status).toBe(401)
    })

    it('removes the user', async () => {
      const response = await api.post('/auth/login', user)
      expect(response.status).toBe(401)
    })
  })
})
