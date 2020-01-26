import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Security } from './security.entity'
import { SecurityPrice } from './prices/price.entity'
import { SecuritiesResolver } from './securities.resolvers'
import { SecuritiesService } from './securities.service'
import { SecuritiesKpisService } from './securities.kpis.service'
import { SecuritiesController } from './securities.controller'
import { PortfoliosModule } from '../portfolios.module'
import { SecuritiesPricesModule } from './prices/prices.module'
import { CurrenciesModule } from '../../currencies/currencies.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Security, SecurityPrice]),
    forwardRef(() => PortfoliosModule),
    SecuritiesPricesModule,
    CurrenciesModule,
  ],
  providers: [SecuritiesResolver, SecuritiesService, SecuritiesKpisService],
  controllers: [SecuritiesController],
  exports: [SecuritiesService],
})
export class SecuritiesModule {}
