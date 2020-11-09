import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'

import { createApp } from '../src/app.factory'

describe('Authentication (e2e)', () => {
  let app: INestApplication
  let http: any

  const user = { username: 'TestUser', password: 'testpassword' }

  beforeAll(async () => {
    app = await createApp('test')
    await app.init()
    http = app.getHttpServer()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Authentication', () => {
    describe('/auth/register', () => {
      let registerResponse

      beforeAll(async () => {
        try {
          // Delete potentially existing user
          const response = await request(http).post('/auth/login').send(user)
          await request(http)
            .delete('/auth/users/me')
            .set('Authorization', 'bearer ' + response.body.token)
        } catch {}
      })

      describe('successful registration', () => {
        let me

        beforeAll(async () => {
          registerResponse = await request(http)
            .post('/auth/register')
            .send(user)
        })

        it('returns session token', () => {
          expect(registerResponse.status).toBe(201)
          expect(typeof registerResponse.body.token).toBe('string')
        })

        it('does not return user information', () => {
          expect(registerResponse.body.user).toBeUndefined()
        })

        it('returns valid session token', async () => {
          const response = await request(http)
            .get('/auth/users/me')
            .set('Authorization', 'bearer ' + registerResponse.body.token)

          expect(response.status).toBe(200)
          me = response.body
        })

        it('converts username to lowercase', () => {
          expect(me.username).toBe(user.username.toLowerCase())

          // Make sure we are not testing with lowercase username only
          expect(me.username).not.toBe(user.username)
        })

        it('fails to register same user again', async () => {
          const response = await request(http).post('/auth/register').send(user)
          expect(response.status).toBe(400)
          expect(response.body.message).toBe('Username is already in use.')
        })
      })

      describe('failed registrations', () => {
        it('fails without username', async () => {
          const response = await request(http)
            .post('/auth/register')
            .send({ password: 'testpassword' })

          expect(response.status).toBe(400)
          expect(response.body.message).toContain('Username is missing')
        })

        it('fails with empty username', async () => {
          const response = await request(http)
            .post('/auth/register')
            .send({ user: '', password: 'testpassword' })

          expect(response.status).toBe(400)
          expect(response.body.message).toContain('Username is missing')
        })

        it('fails without password', async () => {
          const response = await request(http)
            .post('/auth/register')
            .send({ username: 'randomuser' })

          expect(response.status).toBe(400)
          expect(response.body.message).toContain('Password is missing')
        })

        it('fails with empty password', async () => {
          const response = await request(http)
            .post('/auth/register')
            .send({ username: 'randomuser', password: '' })

          expect(response.status).toBe(400)
          expect(response.body.message).toContainEqual(
            expect.stringContaining('Password is too short'),
          )
        })
      })

      afterAll(async () => {
        await request(http)
          .delete('/auth/users/me')
          .set('Authorization', 'bearer ' + registerResponse.body.token)
      })
    })

    describe('/auth/login', () => {
      let loginResponse
      let me

      beforeAll(async () => {
        await request(http).post('/auth/register').send(user)
        loginResponse = await request(http).post('/auth/login').send(user)
      })

      describe('successful login', () => {
        it('returns session token', async () => {
          expect(loginResponse.status).toBe(201)
          expect(typeof loginResponse.body.token).toBe('string')
        })

        it('returns valid session token', async () => {
          const response = await request(http)
            .get('/auth/users/me')
            .set('Authorization', 'bearer ' + loginResponse.body.token)

          expect(response.status).toBe(200)
          me = response.body
        })

        it('does not return user information', () => {
          expect(loginResponse.body.user).toBeUndefined()
        })

        it('converts username to lowercase', () => {
          expect(me.username).toBe(user.username.toLowerCase())

          // Make sure we are not testing with lowercase username only
          expect(me.username).not.toBe(user.username)
        })
      })

      describe('failed logins', () => {
        it('fails without password', async () => {
          const response = await request(http)
            .post('/auth/login')
            .send({ username: user.username })

          expect(response.status).toBe(401)
        })

        it('fails with wrong password', async () => {
          const response = await request(http)
            .post('/auth/login')
            .send({ username: user.username, password: 'wrong' })

          expect(response.status).toBe(401)
        })
      })

      afterAll(async () => {
        await request(http)
          .delete('/auth/users/me')
          .set('Authorization', 'bearer ' + loginResponse.body.token)
      })
    })

    describe('/auth/logout', () => {
      let registerResponse

      beforeAll(async () => {
        registerResponse = await request(http).post('/auth/register').send(user)
      })

      describe('successful logout', () => {
        it('returns nothing', async () => {
          const response = await request(http)
            .post('/auth/logout')
            .set('Authorization', 'bearer ' + registerResponse.body.token)
          expect(response.status).toBe(204)
          expect(response.body).toStrictEqual({})
        })

        it('invalidates session token', async () => {
          const response = await request(http)
            .get('/auth/users/me')
            .set('Authorization', 'bearer ' + registerResponse.body.token)

          expect(response.status).toBe(401)
        })

        it('removes user', async () => {
          const response = await request(http).post('/auth/login')

          expect(response.status).toBe(401)
        })
      })

      it('fails without session token', async () => {
        const response = await request(http).post('/auth/logout')
        expect(response.status).toBe(401)
      })
    })
  })
})
