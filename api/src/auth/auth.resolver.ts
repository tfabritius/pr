import { UnauthorizedException } from '@nestjs/common'
import { Resolver, Mutation, Args, Parent, ResolveField } from '@nestjs/graphql'

import { LoginUserDto } from './dto/login.user.dto'
import { RegisterUserDto } from './dto/register.user.dto'
import { AuthService } from './auth.service'
import { Session } from './sessions/session.entity'
import { SessionsService } from './sessions/sessions.service'
import { UsersService } from './users/users.service'
import { User } from './users/user.entity'

@Resolver(() => Session)
export class AuthResolver {
  constructor(
    private readonly auth: AuthService,
    private readonly sessions: SessionsService,
    private readonly users: UsersService,
  ) {}

  @Mutation(() => Session)
  async register(@Args('data') { username, password }: RegisterUserDto) {
    const user = await this.users.create(username)
    await this.users.updatePassword(user, password)
    const session = await this.sessions.create(user)
    return session
  }

  @Mutation(() => Session)
  async login(@Args('data') { username, password }: LoginUserDto) {
    const user = await this.auth.validateUsernamePassword(username, password)
    if (!user) {
      throw new UnauthorizedException()
    }
    const session = await this.sessions.create(user)
    return session
  }

  @ResolveField('user', () => User)
  async user(@Parent() session: Session) {
    return await this.sessions.validateToken(session.token)
  }
}
