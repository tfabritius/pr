import { forwardRef, Module } from '@nestjs/common'

import { TransactionsController } from './transactions.controller'
import { TransactionsService } from './transactions.service'
import { PortfoliosModule } from '../portfolios.module'
import { PrismaService } from '../../prisma.service'

@Module({
  imports: [forwardRef(() => PortfoliosModule)],
  providers: [TransactionsService, PrismaService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
