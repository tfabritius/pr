import * as request from 'supertest'

export async function loginAndDeleteUser(http, user) {
  const response = await request(http).post('/auth/login').send(user)
  await request(http)
    .delete('/auth/users/me')
    .set('Authorization', 'bearer ' + response.body.token)
}

export async function registerUser(http, user): Promise<string> {
  await loginAndDeleteUser(http, user)

  const registerResponse = await request(http).post('/auth/register').send(user)
  if (registerResponse.status !== 201) {
    throw new Error('Failed to register user')
  }
  return registerResponse.body.token
}
