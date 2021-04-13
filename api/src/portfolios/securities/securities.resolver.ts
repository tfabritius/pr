import { UseGuards } from '@nestjs/common'
import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'

import { PortfolioSecurity } from './security.entity'
import { PortfolioSecuritiesService } from './securities.service'
import { SecuritiesKpisService } from './securities.kpis.service'
import { AuthUser } from '../../auth/auth.decorator'
import { User } from '../../auth/users/user.entity'
import { GqlAuthGuard } from '../../auth/gql-auth.guard'
import { PortfoliosService } from '../portfolios.service'

@Resolver(() => PortfolioSecurity)
@UseGuards(GqlAuthGuard)
export class PortfolioSecuritiesResolver {
  constructor(
    private portfoliosService: PortfoliosService,
    private securitiesService: PortfolioSecuritiesService,
    private securitiesKpisService: SecuritiesKpisService,
  ) {}

  @Query(() => [PortfolioSecurity])
  async securities(
    @Args('portfolioId', { type: () => Int }) portfolioId: number,
    @AuthUser() user: User,
  ) {
    await this.portfoliosService.getOneOfUser(user, { portfolioId })
    return await this.securitiesService.getAll({ portfolioId })
  }

  @Query(() => PortfolioSecurity)
  async security(
    @Args('portfolioId', { type: () => Int }) portfolioId: number,
    @Args('uuid') securityUuid: string,
    @AuthUser() user: User,
  ) {
    return this.securitiesService.getOneOfUser(
      portfolioId,
      securityUuid,
      user.id,
    )
  }

  @ResolveField(() => String)
  async shares(@Parent() security: PortfolioSecurity) {
    return await this.securitiesKpisService.getShares(security)
  }

  @ResolveField(() => String)
  async quote(
    @Parent() security: PortfolioSecurity,
    @Args('currencyCode', { nullable: true }) currencyCode: string,
  ) {
    return await this.securitiesKpisService.getQuote(security, {
      currencyCode,
    })
  }
}
