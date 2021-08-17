import { Parent, ResolveField, Resolver } from '@nestjs/graphql'

import { PrismaService } from '../prisma.service'
import { SecurityMarket } from './security-markets.entity'
import { Market } from './markets.entity'

@Resolver(() => SecurityMarket)
export class SecurityMarketsResolver {
  constructor(private prisma: PrismaService) {}

  @ResolveField(() => Market)
  async market(@Parent() securityMarket: SecurityMarket) {
    return this.prisma.market.findUnique({
      where: { code: securityMarket.marketCode },
    })
  }
}
