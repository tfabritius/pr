import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'

import { UsersService } from './users/users.service'

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
    } catch {
      // do nothing -> return nothing
    }
  }
}
