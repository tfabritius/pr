import { forwardRef, Module } from '@nestjs/common'

import { AccountsService } from './accounts.service'
import { AccountsKpisService } from './accounts.kpis.service'
import { AccountsController } from './accounts.controller'
import { PortfoliosModule } from '../portfolios.module'
import { CurrenciesModule } from '../../currencies/currencies.module'
import { PrismaService } from '../../prisma.service'
import { TransactionsService } from '../transactions/transactions.service'

@Module({
  imports: [forwardRef(() => PortfoliosModule), CurrenciesModule],
  providers: [
    AccountsService,
    AccountsKpisService,
    PrismaService,
    TransactionsService,
  ],
  controllers: [AccountsController],
  exports: [AccountsService],
})
export class AccountsModule {}
