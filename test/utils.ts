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

export async function createPortfolio(
  http,
  sessionToken: string,
  portfolio,
): Promise<number> {
  const createResponse = await request(http)
    .post('/portfolios')
    .send(portfolio)
    .set('Authorization', 'bearer ' + sessionToken)

  if (createResponse.status !== 201) {
    throw new Error('Failed to create portfolio')
  }
  return createResponse.body.id
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
  return await createPortfolio(http, sessionToken, testPortfolio)
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

export async function createTestDepositAccount(
  http,
  sessionToken,
  portfolioId: number,
): Promise<number> {
  const testDepositAccount = {
    type: 'deposit',
    name: 'Test deposit account',
    uuid: '42',
    note: 'comment',
    currencyCode: 'EUR',
  }
  return await createAccount(
    http,
    sessionToken,
    portfolioId,
    testDepositAccount,
  )
}

export async function createTestDepositSecuritiesAccounts(
  http,
  sessionToken,
  portfolioId,
): Promise<[number, number]> {
  const testDepositAccountId = await createTestDepositAccount(
    http,
    sessionToken,
    portfolioId,
  )
  const testSecuritiesAccount = {
    type: 'securities',
    name: 'Test securities account',
    uuid: '42',
    note: 'comment',
    referenceAccount: { id: testDepositAccountId },
  }
  const testSecuritiesAccountId = await createAccount(
    http,
    sessionToken,
    portfolioId,
    testSecuritiesAccount,
  )
  return [testDepositAccountId, testSecuritiesAccountId]
}

export async function createSecurity(
  http,
  sessionToken: string,
  portfolioId: number,
  security?,
): Promise<number> {
  security = security ?? {
    name: 'Test security',
    uuid: '',
    note: '',
    currencyCode: '',
    isin: '',
    wkn: '',
    symbol: '',
  }

  const createResponse = await request(http)
    .post(`/portfolios/${portfolioId}/securities`)
    .send(security)
    .set('Authorization', 'bearer ' + sessionToken)

  if (createResponse.status !== 201) {
    throw new Error('Failed to create security')
  }
  return createResponse.body.id
}

export async function createTransaction(
  http,
  sessionToken: string,
  portfolioId: number,
  transaction,
): Promise<number> {
  const createResponse = await request(http)
    .post(`/portfolios/${portfolioId}/transactions`)
    .send(transaction)
    .set('Authorization', 'bearer ' + sessionToken)

  if (createResponse.status !== 201) {
    throw new Error('Failed to create transaction')
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
