import { UseGuards } from '@nestjs/common'
import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'

import { Portfolio } from './portfolio.entity'
import { PortfoliosService } from './portfolios.service'
import { PortfolioSecuritiesService } from './securities/securities.service'
import { GqlAuthGuard } from '../auth/gql-auth.guard'
import { AuthUser } from '../auth/auth.decorator'
import { User } from '../auth/users/user.entity'
import { PortfolioSecurity } from './securities/security.entity'

@Resolver(() => Portfolio)
@UseGuards(GqlAuthGuard)
export class PortfoliosResolver {
  constructor(
    private portfoliosService: PortfoliosService,
    private securitiesService: PortfolioSecuritiesService,
  ) {}

  @Query(() => [Portfolio])
  async portfolios(@AuthUser() user: User) {
    return this.portfoliosService.getAllOfUser(user)
  }

  @Query(() => Portfolio)
  async portfolio(
    @Args('id', { type: () => Int }) id: number,
    @AuthUser() user: User,
  ) {
    return this.portfoliosService.getOneOfUser(user, { portfolioId: id })
  }

  @ResolveField(() => [PortfolioSecurity])
  async securities(@Parent() portfolio: Portfolio) {
    return this.securitiesService.getAll({ portfolioId: portfolio.id })
  }
}
