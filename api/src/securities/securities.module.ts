import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { PrismaService } from '../prisma.service'
import { SecuritiesResolver } from './securities.resolver'
import { SecuritiesService } from './securities.service'
import { SecuritiesController } from './securities.controller'
import { SecurityMarketsService } from './markets.service'
import { SecurityMarketsResolver } from './security-markets.resolver'
import { SecurityTaxonomiesResolver } from './security-taxonomies.resolver'
import { TaxonomiesResolver } from './taxonomies.resolver'

@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    SecuritiesResolver,
    SecurityMarketsResolver,
    SecurityTaxonomiesResolver,
    SecuritiesService,
    SecurityMarketsService,
    TaxonomiesResolver,
  ],
  controllers: [SecuritiesController],
  exports: [SecuritiesService],
})
export class SecuritiesModule {}
