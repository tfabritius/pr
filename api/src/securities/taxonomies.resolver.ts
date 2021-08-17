import { Parent, ResolveField, Resolver } from '@nestjs/graphql'

import { PrismaService } from '../prisma.service'
import { Taxonomy } from './taxonomies.entity'

@Resolver(() => Taxonomy)
export class TaxonomiesResolver {
  constructor(private prisma: PrismaService) {}

  @ResolveField(() => Taxonomy)
  async root(@Parent() taxonomy: Taxonomy) {
    return this.prisma.taxonomy.findUnique({
      where: { uuid: taxonomy.rootUuid },
    })
  }
}
