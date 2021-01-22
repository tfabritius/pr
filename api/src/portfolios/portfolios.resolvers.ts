import { Args, Int, Query, Resolver } from '@nestjs/graphql'

import { Portfolio } from './portfolio.entity'
import { PortfoliosService } from './portfolios.service'

@Resolver(() => Portfolio)
export class PortfoliosResolver {
  constructor(private portfoliosService: PortfoliosService) {}

  @Query(() => Portfolio)
  async portfolio(@Args('id', { type: () => Int }) id: number) {
    return this.portfoliosService.getOne({ portfolioId: id })
  }
}
