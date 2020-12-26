import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Transaction } from './transaction.entity'
import { TransactionsController } from './transactions.controller'
import { TransactionsService } from './transactions.service'
import { PortfoliosModule } from '../portfolios.module'
import { AccountsModule } from '../accounts/accounts.module'
import { SecuritiesModule } from '../securities/securities.module'
import { TransactionUnit } from './unit.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, TransactionUnit]),
    forwardRef(() => PortfoliosModule),
    forwardRef(() => AccountsModule),
    forwardRef(() => SecuritiesModule),
  ],
  providers: [TransactionsService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
