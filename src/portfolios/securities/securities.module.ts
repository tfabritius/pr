import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Security } from './security.entity'
import { SecurityPrice } from './prices/price.entity'
import { SecuritiesService } from './securities.service'
import { SecuritiesKpisService } from './securities.kpis.service'
import { SecuritiesController } from './securities.controller'
import { PortfoliosModule } from '../portfolios.module'
import { SecuritiesPricesModule } from './prices/prices.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Security, SecurityPrice]),
    forwardRef(() => PortfoliosModule),
    SecuritiesPricesModule,
  ],
  providers: [SecuritiesService, SecuritiesKpisService],
  controllers: [SecuritiesController],
  exports: [SecuritiesService],
})
export class SecuritiesModule {}
