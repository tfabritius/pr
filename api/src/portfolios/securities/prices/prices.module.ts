import { forwardRef, Module } from '@nestjs/common'

import { SecuritiesPricesService } from './prices.service'
import { SecuritiesPricesController } from './prices.controller'
import { PortfoliosModule } from '../../portfolios.module'
import { PortfolioSecuritiesModule } from '../securities.module'
import { PrismaService } from '../../../prisma.service'

@Module({
  imports: [
    forwardRef(() => PortfoliosModule),
    forwardRef(() => PortfolioSecuritiesModule),
  ],
  providers: [SecuritiesPricesService, PrismaService],
  controllers: [SecuritiesPricesController],
  exports: [SecuritiesPricesService],
})
export class SecuritiesPricesModule {}
