import { forwardRef, Module } from '@nestjs/common'

import { SecuritiesPricesService } from './prices.service'
import { SecuritiesPricesController } from './prices.controller'
import { PortfoliosModule } from '../../portfolios.module'
import { SecuritiesModule } from '../securities.module'
import { PrismaService } from '../../../prisma.service'

@Module({
  imports: [
    forwardRef(() => PortfoliosModule),
    forwardRef(() => SecuritiesModule),
  ],
  providers: [SecuritiesPricesService, PrismaService],
  controllers: [SecuritiesPricesController],
  exports: [SecuritiesPricesService],
})
export class SecuritiesPricesModule {}
