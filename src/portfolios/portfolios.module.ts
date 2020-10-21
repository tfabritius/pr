import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Portfolio } from './portfolio.entity'
import { PortfoliosService } from './portfolios.service'
import { PortfoliosController } from './portfolios.controller'
import { SecuritiesModule } from './securities/securities.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Portfolio]),
    forwardRef(() => SecuritiesModule),
  ],
  providers: [PortfoliosService],
  controllers: [PortfoliosController],
  exports: [PortfoliosService],
})
export class PortfoliosModule {}
