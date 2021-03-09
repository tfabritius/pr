import * as request from 'supertest'

export class ApiClient {
  private request: request.SuperTest<request.Test>
  private sessionToken: string

  static create(httpServer): ApiClient {
    const apiClient = new ApiClient()
    apiClient.request = request(httpServer)
    return apiClient
  }

  session(sessionToken): ApiClient {
    const apiClient = new ApiClient()
    apiClient.request = this.request
    apiClient.sessionToken = sessionToken
    return apiClient
  }

  async cleanUser(user, validate = true) {
    const [authApi] = await this.login(user, validate)
    const response = await authApi.delete('/auth/users/me')
    if (validate && response.status !== 204) {
      throw new Error(`Failed to delete user: ${JSON.stringify(response.body)}`)
    }
  }

  async register(
    payload,
    validate = true,
  ): Promise<[ApiClient, request.Response]> {
    const response = await this.post('/auth/register', payload)
    if (validate && response.status !== 201) {
      throw new Error(
        `Failed to register user: ${JSON.stringify(response.body)}`,
      )
    }
    return [this.session(response.body.token), response]
  }

  async login(
    payload,
    validate = true,
  ): Promise<[ApiClient, request.Response]> {
    const response = await this.post('/auth/login', payload)
    if (validate && response.status !== 201) {
      throw new Error(`Failed to login user: ${JSON.stringify(response.body)}`)
    }
    return [this.session(response.body.token), response]
  }

  private addAuth(req) {
    if (this.sessionToken) {
      req.set('Authorization', 'bearer ' + this.sessionToken)
    }
  }

  public async createPortfolio(portfolio?): Promise<number> {
    portfolio = portfolio ?? {
      name: 'Test Portfolio',
      note: 'Test comment',
      baseCurrencyCode: 'EUR',
    }
    const createResponse = await this.post('/portfolios', portfolio)

    if (createResponse.status !== 201) {
      throw new Error(
        `Failed to create portfolio: ${JSON.stringify(createResponse.body)}`,
      )
    }
    return createResponse.body.id
  }

  async createSecurity(portfolioId: number, security?): Promise<string> {
    security = security ?? {
      name: 'Test security',
      note: '',
      currencyCode: 'EUR',
      isin: '',
      wkn: '',
      symbol: '',
    }

    const createResponse = await this.post(
      `/portfolios/${portfolioId}/securities`,
      security,
    )

    if (createResponse.status !== 201) {
      throw new Error(
        `Failed to create security: ${JSON.stringify(createResponse.body)}`,
      )
    }
    return createResponse.body.uuid
  }

  async createAccount(portfolioId: number, account): Promise<string> {
    const createResponse = await this.post(
      `/portfolios/${portfolioId}/accounts`,
      account,
    )

    if (createResponse.status !== 201) {
      throw new Error(
        `Failed to create account: : ${JSON.stringify(createResponse.body)}`,
      )
    }
    return createResponse.body.uuid
  }

  async createTestDepositSecuritiesAccounts(
    portfolioId: number,
  ): Promise<[string, string]> {
    const testDepositAccount = {
      type: 'deposit',
      name: 'Test deposit account',
      note: '',
      currencyCode: 'EUR',
    }
    const testDepositAccountUuid = await this.createAccount(
      portfolioId,
      testDepositAccount,
    )
    const testSecuritiesAccount = {
      type: 'securities',
      name: 'Test securities account',
      note: '',
      referenceAccountUuid: testDepositAccountUuid,
    }
    const testSecuritiesAccountUuid = await this.createAccount(
      portfolioId,
      testSecuritiesAccount,
    )
    return [testDepositAccountUuid, testSecuritiesAccountUuid]
  }

  async createTransaction(portfolioId: number, transaction): Promise<string> {
    const createResponse = await this.post(
      `/portfolios/${portfolioId}/transactions`,
      transaction,
    )

    if (createResponse.status !== 201) {
      throw new Error(
        `Failed to create transaction: ${JSON.stringify(createResponse.body)}`,
      )
    }
    return createResponse.body.uuid
  }

  public async get(url: string) {
    const req = this.request.get(url)
    this.addAuth(req)
    return req
  }

  public async post(url: string, payload?) {
    const req = this.request.post(url)
    this.addAuth(req)
    if (payload) {
      req.send(payload)
    }
    return req
  }

  public async put(url: string, payload?) {
    const req = this.request.put(url)
    this.addAuth(req)
    if (payload) {
      req.send(payload)
    }
    return req
  }

  public async patch(url: string, payload?) {
    const req = this.request.patch(url)
    this.addAuth(req)
    if (payload) {
      req.send(payload)
    }
    return req
  }

  public async delete(url: string) {
    const req = this.request.delete(url)
    this.addAuth(req)
    return req
  }
}
