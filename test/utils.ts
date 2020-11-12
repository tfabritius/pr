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

export async function createTestPortfolio(
  http,
  sessionToken: string,
): Promise<number> {
  const testPortfolio = {
    name: 'Test Portfolio',
    note: 'Test comment',
    baseCurrencyCode: 'EUR',
  }

  const createResponse = await request(http)
    .post('/portfolios')
    .send(testPortfolio)
    .set('Authorization', 'bearer ' + sessionToken)

  if (createResponse.status !== 201) {
    throw new Error('Failed to create portfolio')
  }
  return createResponse.body.id
}

export async function createAccount(
  http,
  sessionToken: string,
  portfolioId: number,
  account,
): Promise<number> {
  const createResponse = await request(http)
    .post(`/portfolios/${portfolioId}/accounts`)
    .send(account)
    .set('Authorization', 'bearer ' + sessionToken)

  if (createResponse.status !== 201) {
    throw new Error('Failed to create account')
  }
  return createResponse.body.id
}

export async function createSecurity(
  http,
  sessionToken: string,
  portfolioId: number,
  security,
): Promise<number> {
  const createResponse = await request(http)
    .post(`/portfolios/${portfolioId}/securities`)
    .send(security)
    .set('Authorization', 'bearer ' + sessionToken)

  if (createResponse.status !== 201) {
    throw new Error('Failed to create security')
  }
  return createResponse.body.id
}

/**
 * Takes an object and creates a list of objects, each missing a single attribute
 */
export function getObjectsWithMissingAttribute<T>(
  object: T,
): Array<[string, T]> {
  const ret = []
  for (const missingAttribute of Object.keys(object)) {
    const objectCopy = { ...object }
    delete objectCopy[missingAttribute]
    ret.push([missingAttribute, objectCopy])
  }
  return ret
}
