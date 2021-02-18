import { forwardRef, Module } from '@nestjs/common'

import { SecuritiesResolver } from './securities.resolver'
import { SecuritiesService } from './securities.service'
import { SecuritiesKpisService } from './securities.kpis.service'
import { SecuritiesController } from './securities.controller'
import { PortfoliosModule } from '../portfolios.module'
import { SecuritiesPricesModule } from './prices/prices.module'
import { CurrenciesModule } from '../../currencies/currencies.module'
import { PrismaService } from '../../prisma.service'

@Module({
  imports: [
    forwardRef(() => PortfoliosModule),
    SecuritiesPricesModule,
    CurrenciesModule,
  ],
  providers: [
    PrismaService,
    SecuritiesResolver,
    SecuritiesService,
    SecuritiesKpisService,
  ],
  controllers: [SecuritiesController],
  exports: [SecuritiesService],
})
export class SecuritiesModule {}
