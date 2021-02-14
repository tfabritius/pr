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
import { SecuritiesService } from './securities/securities.service'
import { GqlAuthGuard } from '../auth/gql-auth.guard'

@Resolver(() => Portfolio)
@UseGuards(GqlAuthGuard)
export class PortfoliosResolver {
  constructor(
    private portfoliosService: PortfoliosService,
    private securitiesService: SecuritiesService,
  ) {}

  @Query(() => Portfolio)
  async portfolio(@Args('id', { type: () => Int }) id: number) {
    return this.portfoliosService.getOne({ portfolioId: id })
  }

  @ResolveField()
  async securities(@Parent() portfolio: Portfolio) {
    return this.securitiesService.getAll({ portfolioId: portfolio.id })
  }
}
