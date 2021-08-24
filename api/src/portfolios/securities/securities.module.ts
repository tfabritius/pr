import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { PortfolioSecuritiesResolver } from './securities.resolver'
import { PortfolioSecuritiesService } from './securities.service'
import { SecuritiesKpisService } from './securities.kpis.service'
import { PortfolioSecuritiesController } from './securities.controller'
import { PortfoliosModule } from '../portfolios.module'
import { PortfolioSecurityPricesModule } from './prices/prices.module'
import { CurrenciesModule } from '../../currencies/currencies.module'
import { PrismaService } from '../../prisma.service'
import { TransactionsService } from '../transactions/transactions.service'
import { SecuritiesModule } from '../../securities/securities.module'

@Module({
  imports: [
    forwardRef(() => PortfoliosModule),
    PortfolioSecurityPricesModule,
    CurrenciesModule,
    ConfigModule,
    SecuritiesModule,
  ],
  providers: [
    PrismaService,
    PortfolioSecuritiesResolver,
    PortfolioSecuritiesService,
    SecuritiesKpisService,
    TransactionsService,
  ],
  controllers: [PortfolioSecuritiesController],
  exports: [PortfolioSecuritiesService],
})
export class PortfolioSecuritiesModule {}
