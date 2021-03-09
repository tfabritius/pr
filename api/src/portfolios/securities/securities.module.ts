import { forwardRef, Module } from '@nestjs/common'

import { PortfolioSecuritiesResolver } from './securities.resolver'
import { PortfolioSecuritiesService } from './securities.service'
import { SecuritiesKpisService } from './securities.kpis.service'
import { PortfolioSecuritiesController } from './securities.controller'
import { PortfoliosModule } from '../portfolios.module'
import { PortfolioSecurityPricesModule } from './prices/prices.module'
import { CurrenciesModule } from '../../currencies/currencies.module'
import { PrismaService } from '../../prisma.service'

@Module({
  imports: [
    forwardRef(() => PortfoliosModule),
    PortfolioSecurityPricesModule,
    CurrenciesModule,
  ],
  providers: [
    PrismaService,
    PortfolioSecuritiesResolver,
    PortfolioSecuritiesService,
    SecuritiesKpisService,
  ],
  controllers: [PortfolioSecuritiesController],
  exports: [PortfolioSecuritiesService],
})
export class PortfolioSecuritiesModule {}
