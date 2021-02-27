import { UnauthorizedException, UseGuards } from '@nestjs/common'
import {
  Resolver,
  Mutation,
  Args,
  Parent,
  ResolveField,
  Query,
} from '@nestjs/graphql'

import { LoginUserDto } from './dto/login.user.dto'
import { RegisterUserDto } from './dto/register.user.dto'
import { AuthService } from './auth.service'
import { Session } from './sessions/session.entity'
import { SessionsService } from './sessions/sessions.service'
import { UsersService } from './users/users.service'
import { User } from './users/user.entity'
import { AuthUser } from './auth.decorator'
import { GqlAuthGuard } from './gql-auth.guard'
import { UserAgent } from '../utils/user-agent.decorator'

@Resolver(() => Session)
export class AuthResolver {
  constructor(
    private readonly auth: AuthService,
    private readonly sessions: SessionsService,
    private readonly users: UsersService,
  ) {}

  @Mutation(() => Session)
  async register(
    @Args('data') { username, password }: RegisterUserDto,
    @UserAgent() userAgent: string,
  ) {
    const user = await this.users.create(username)
    await this.users.updatePassword(user, password)
    const session = await this.sessions.create(user, {
      note: userAgent,
    })
    return session
  }

  @Mutation(() => Session)
  async login(
    @Args('data') { username, password }: LoginUserDto,
    @UserAgent() userAgent: string,
  ) {
    const user = await this.auth.validateUsernamePassword(username, password)
    if (!user) {
      throw new UnauthorizedException()
    }
    const session = await this.sessions.create(user, {
      note: userAgent,
    })
    return session
  }

  @Mutation(() => Session)
  @UseGuards(GqlAuthGuard)
  async createSession(@AuthUser() user: User, @Args('note') note: string) {
    return await this.sessions.create(user, { note })
  }

  @Query(() => [Session], { name: 'sessions' })
  @UseGuards(GqlAuthGuard)
  async getSessions(@AuthUser() user: User) {
    return await this.sessions.getAllOfUser(user)
  }

  @Mutation(() => Session)
  @UseGuards(GqlAuthGuard)
  async updateSession(
    @AuthUser() user: User,
    @Args('token') token: string,
    @Args('note') note: string,
  ) {
    return await this.sessions.update({ token, note }, user)
  }

  @Mutation(() => Session)
  async deleteSession(@Args('token') token: string) {
    return await this.sessions.delete(token)
  }

  @ResolveField('user', () => User)
  async user(@Parent() session: Session) {
    return await this.sessions.validateToken(session.token)
  }
}
