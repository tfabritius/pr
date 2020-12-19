import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { SecurityPrice } from './price.entity'
import { SecuritiesPricesService } from './prices.service'
import { SecuritiesPricesController } from './prices.controller'
import { PortfoliosModule } from '../../portfolios.module'
import { SecuritiesModule } from '../securities.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([SecurityPrice]),
    forwardRef(() => PortfoliosModule),
    forwardRef(() => SecuritiesModule),
  ],
  providers: [SecuritiesPricesService],
  controllers: [SecuritiesPricesController],
  exports: [SecuritiesPricesService],
})
export class SecuritiesPricesModule {}
