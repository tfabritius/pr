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

  public async delete(url: string) {
    const req = this.request.delete(url)
    this.addAuth(req)
    return req
  }
}
