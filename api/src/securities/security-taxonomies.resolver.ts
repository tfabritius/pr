import { Parent, ResolveField, Resolver } from '@nestjs/graphql'

import { PrismaService } from '../prisma.service'
import { SecurityTaxonomy } from './security-taxonomies.entity'
import { Taxonomy } from './taxonomies.entity'

@Resolver(() => SecurityTaxonomy)
export class SecurityTaxonomiesResolver {
  constructor(private prisma: PrismaService) {}

  @ResolveField(() => Taxonomy)
  async taxonomy(@Parent() securityTaxonomy: SecurityTaxonomy) {
    return this.prisma.taxonomy.findUnique({
      where: { uuid: securityTaxonomy.taxonomyUuid },
    })
  }
}
