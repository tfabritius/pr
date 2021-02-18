import { forwardRef, Module } from '@nestjs/common'

import { PortfoliosResolver } from './portfolios.resolver'
import { PortfoliosService } from './portfolios.service'
import { PortfoliosController } from './portfolios.controller'
import { SecuritiesModule } from './securities/securities.module'
import { AccountsModule } from './accounts/accounts.module'
import { TransactionsModule } from './transactions/transactions.module'
import { PrismaService } from '../prisma.service'

@Module({
  imports: [
    forwardRef(() => SecuritiesModule),
    forwardRef(() => AccountsModule),
    forwardRef(() => TransactionsModule),
  ],
  providers: [PortfoliosResolver, PortfoliosService, PrismaService],
  controllers: [PortfoliosController],
  exports: [PortfoliosService],
})
export class PortfoliosModule {}
