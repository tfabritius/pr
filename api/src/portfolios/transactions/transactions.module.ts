import { forwardRef, Module } from '@nestjs/common'

import { TransactionsController } from './transactions.controller'
import { TransactionsService } from './transactions.service'
import { PortfoliosModule } from '../portfolios.module'
import { AccountsModule } from '../accounts/accounts.module'
import { PortfolioSecuritiesModule } from '../securities/securities.module'
import { PrismaService } from '../../prisma.service'

@Module({
  imports: [
    forwardRef(() => PortfoliosModule),
    forwardRef(() => AccountsModule),
    forwardRef(() => PortfolioSecuritiesModule),
  ],
  providers: [TransactionsService, PrismaService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
