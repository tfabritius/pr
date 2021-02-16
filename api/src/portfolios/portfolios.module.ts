import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Portfolio } from './portfolio.entity'
import { PortfoliosResolver } from './portfolios.resolver'
import { PortfoliosService } from './portfolios.service'
import { PortfoliosController } from './portfolios.controller'
import { SecuritiesModule } from './securities/securities.module'
import { AccountsModule } from './accounts/accounts.module'
import { TransactionsModule } from './transactions/transactions.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Portfolio]),
    forwardRef(() => SecuritiesModule),
    forwardRef(() => AccountsModule),
    forwardRef(() => TransactionsModule),
  ],
  providers: [PortfoliosResolver, PortfoliosService],
  controllers: [PortfoliosController],
  exports: [PortfoliosService],
})
export class PortfoliosModule {}
