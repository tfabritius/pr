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
        const response = await request(http)
          .delete('/auth/users/me')
          .set('Authorization', 'bearer ' + registerResponse.body.token)
        expect(response.status).toBe(204)
      })
    })

    describe('/auth/login', () => {
      let loginResponse
      let me

      beforeAll(async () => {
        const response = await request(http).post('/auth/register').send(user)
        expect(response.status).toBe(201)

        loginResponse = await request(http).post('/auth/login').send(user)
      })

      describe('successful login', () => {
        it('returns session token', () => {
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
        const response = await request(http)
          .delete('/auth/users/me')
          .set('Authorization', 'bearer ' + loginResponse.body.token)
        expect(response.status).toBe(204)
      })
    })

    describe('/auth/logout', () => {
      let registerResponse

      beforeAll(async () => {
        registerResponse = await request(http).post('/auth/register').send(user)
        expect(registerResponse.status).toBe(201)
      })

      describe('successful logout', () => {
        let logoutResponse

        beforeAll(async () => {
          logoutResponse = await request(http)
            .post('/auth/logout')
            .set('Authorization', 'bearer ' + registerResponse.body.token)
        })

        it('returns nothing', () => {
          expect(logoutResponse.status).toBe(204)
          expect(logoutResponse.body).toStrictEqual({})
        })

        it('invalidates session token', async () => {
          const response = await request(http)
            .get('/auth/users/me')
            .set('Authorization', 'bearer ' + registerResponse.body.token)

          expect(response.status).toBe(401)
        })
      })

      it('fails without session token', async () => {
        const response = await request(http).post('/auth/logout')
        expect(response.status).toBe(401)
      })

      it('fails with invalid token', async () => {
        const response = await request(http)
          .post('/auth/logout')
          .set('Authorization', 'bearer non-existent')

        expect(response.status).toBe(401)
      })

      afterAll(async () => {
        const loginResponse = await request(http).post('/auth/login').send(user)
        expect(loginResponse.status).toBe(201)
        const deleteResponse = await request(http)
          .delete('/auth/users/me')
          .set('Authorization', 'bearer ' + loginResponse.body.token)
        expect(deleteResponse.status).toBe(204)
      })
    })

    describe('/auth/sessions', () => {
      let registerResponse

      beforeAll(async () => {
        registerResponse = await request(http).post('/auth/register').send(user)
        expect(registerResponse.status).toBe(201)
      })

      afterAll(async () => {
        const response = await request(http)
          .delete('/auth/users/me')
          .set('Authorization', 'bearer ' + registerResponse.body.token)
        expect(response.status).toBe(204)
      })

      it('returns list of sessions', async () => {
        const response = await request(http)
          .get('/auth/sessions')
          .set('Authorization', 'bearer ' + registerResponse.body.token)

        expect(response.status).toBe(200)
        expect(response.body).toContainEqual(
          expect.objectContaining({
            token: registerResponse.body.token,
          }),
        )
      })
    })

    describe('/auth/users', () => {
      let registerResponse

      beforeAll(async () => {
        registerResponse = await request(http).post('/auth/register').send(user)
        expect(registerResponse.status).toBe(201)
      })

      describe('GET ../me', () => {
        it('returns user information', async () => {
          const response = await request(http)
            .get('/auth/users/me')
            .set('Authorization', 'bearer ' + registerResponse.body.token)

          expect(response.status).toBe(200)
          expect(response.body.username).toBe(user.username.toLowerCase())
          expect(response.body.lastSeenAt).toBe(
            new Date().toISOString().slice(0, 10),
          )
        })
      })

      describe('POST ../me/password', () => {
        it('fails if old password is wrong', async () => {
          const response = await request(http)
            .post('/auth/users/me/password')
            .set('Authorization', 'bearer ' + registerResponse.body.token)
            .send({ oldPassword: 'wrong', newPassword: 'newPassword' })
          expect(response.status).toBe(403)
        })

        describe('successful change', () => {
          let changeResponse

          beforeAll(async () => {
            changeResponse = await request(http)
              .post('/auth/users/me/password')
              .set('Authorization', 'bearer ' + registerResponse.body.token)
              .send({ oldPassword: user.password, newPassword: 'newPassword' })
          })

          it('returns nothing', () => {
            expect(changeResponse.status).toBe(201)
            expect(changeResponse.body).toStrictEqual({})
          })

          it('prevents login with old password', async () => {
            const response = await request(http).post('/auth/login').send(user)
            expect(response.status).toBe(401)
          })

          it('allows login with new password', async () => {
            const response = await request(http)
              .post('/auth/login')
              .send({ username: user.username, password: 'newPassword' })
            expect(response.status).toBe(201)
          })
        })
      })

      describe('DELETE ../me', () => {
        let deleteResponse

        beforeAll(async () => {
          deleteResponse = await request(http)
            .delete('/auth/users/me')
            .set('Authorization', 'bearer ' + registerResponse.body.token)
        })

        it('returns nothing', () => {
          expect(deleteResponse.status).toBe(204)
          expect(deleteResponse.body).toStrictEqual({})
        })

        it('removes the session', async () => {
          const response = await request(http)
            .get('/auth/users/me')
            .set('Authorization', 'bearer ' + registerResponse.body.token)

          expect(response.status).toBe(401)
        })

        it('removes the user', async () => {
          const response = await request(http).post('/auth/login').send(user)
          expect(response.status).toBe(401)
        })
      })
    })
  })
})
