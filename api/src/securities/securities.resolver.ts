import { NotFoundException, UseGuards } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'

import { GqlAuthGuardOptional } from '../auth/gql-auth.guard'
import { PrismaService } from '../prisma.service'
import { Event } from './events.entity'
import { Security } from './securities.entity'
import { SecurityMarket } from './security-markets.entity'
import { SecurityTaxonomy } from './security-taxonomies.entity'

@Resolver(() => Security)
@UseGuards(GqlAuthGuardOptional)
export class SecuritiesResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => Security)
  async security(@Args('uuid') uuid: string) {
    const security = await this.prisma.security.findUnique({ where: { uuid } })
    if (!security) {
      throw new NotFoundException('Security not found')
    }
    return security
  }

  @ResolveField(() => [Event])
  async events(@Parent() security: Security) {
    return this.prisma.event.findMany({ where: { security } })
  }

  @ResolveField(() => [SecurityMarket])
  async securityMarkets(@Parent() security: Security) {
    return this.prisma.securityMarket.findMany({
      where: { security },
    })
  }

  @ResolveField(() => [SecurityTaxonomy])
  async securityTaxonomies(@Parent() security: Security) {
    return this.prisma.securityTaxonomy.findMany({ where: { security } })
  }
}
