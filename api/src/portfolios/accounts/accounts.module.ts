import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Account } from './account.entity'
import { AccountsService } from './accounts.service'
import { AccountsKpisService } from './accounts.kpis.service'
import { AccountsController } from './accounts.controller'
import { PortfoliosModule } from '../portfolios.module'
import { CurrenciesModule } from '../../currencies/currencies.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    forwardRef(() => PortfoliosModule),
    CurrenciesModule,
  ],
  providers: [AccountsService, AccountsKpisService],
  controllers: [AccountsController],
  exports: [AccountsService],
})
export class AccountsModule {}
