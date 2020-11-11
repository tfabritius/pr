import * as request from 'supertest'

export async function deleteUserIfExisting(http, user) {
  try {
    const response = await request(http).post('/auth/login').send(user)
    await request(http)
      .delete('/auth/users/me')
      .set('Authorization', 'bearer ' + response.body.token)
  } catch {}
}
