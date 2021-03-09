import { forwardRef, Module } from '@nestjs/common'

import { PortfolioSecurityPricesService } from './prices.service'
import { PortfolioSecurityPricesController } from './prices.controller'
import { PortfoliosModule } from '../../portfolios.module'
import { PortfolioSecuritiesModule } from '../securities.module'
import { PrismaService } from '../../../prisma.service'

@Module({
  imports: [
    forwardRef(() => PortfoliosModule),
    forwardRef(() => PortfolioSecuritiesModule),
  ],
  providers: [PortfolioSecurityPricesService, PrismaService],
  controllers: [PortfolioSecurityPricesController],
  exports: [PortfolioSecurityPricesService],
})
export class PortfolioSecurityPricesModule {}
