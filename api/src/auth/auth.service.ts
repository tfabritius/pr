import { Injectable } from '@nestjs/common'

import { UsersService } from './users/users.service'
import { User } from './users/user.entity'

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUsernamePassword(
    username: string,
    password: string,
  ): Promise<User | undefined> {
    try {
      const user = await this.usersService.getOneByUsername(username)

      if (await this.usersService.verifyPassword(user, password)) {
        return user
      }
    } catch {}
  }
}
