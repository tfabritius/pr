import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { PortfolioSecurity } from '@prisma/client'

import { Security } from './security.entity'
import { SecuritiesService } from './securities.service'
import { SecuritiesKpisService } from './securities.kpis.service'

@Resolver(() => Security)
export class SecuritiesResolver {
  constructor(
    private securitiesService: SecuritiesService,
    private securitiesKpisService: SecuritiesKpisService,
  ) {}

  @Query(() => Security)
  async security(
    @Args('id', { type: () => Int }) id: number,
    @Args('portfolioId', { type: () => Int }) portfolioId: number,
  ) {
    return this.securitiesService.getOne({ securityId: id, portfolioId })
  }

  @ResolveField(() => String)
  async shares(@Parent() security: PortfolioSecurity) {
    const kpis = await this.securitiesKpisService.getKpis(security, {
      baseCurrencyCode: 'EUR',
    })
    return kpis.shares
  }

  @ResolveField(() => String)
  async quote(
    @Parent() security: PortfolioSecurity,
    @Args('currencyCode', { nullable: true }) currencyCode: string,
  ) {
    const kpis = await this.securitiesKpisService.getKpis(security, {
      baseCurrencyCode: currencyCode || 'EUR',
    })
    return kpis.quoteInBaseCurrency
  }
}
