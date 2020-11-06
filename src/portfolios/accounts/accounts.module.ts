import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Account } from './account.entity'
import { AccountsService } from './accounts.service'
import { AccountsController } from './accounts.controller'
import { PortfoliosModule } from '../portfolios.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    forwardRef(() => PortfoliosModule),
  ],
  providers: [AccountsService],
  controllers: [AccountsController],
  exports: [AccountsService],
})
export class AccountsModule {}
