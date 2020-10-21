import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Portfolio } from './portfolio.entity'
import { PortfoliosService } from './portfolios.service'
import { PortfoliosController } from './portfolios.controller'
import { SecuritiesModule } from './securities/securities.module'

@Module({
  imports: [TypeOrmModule.forFeature([Portfolio]), SecuritiesModule],
  providers: [PortfoliosService],
  controllers: [PortfoliosController],
})
export class PortfoliosModule {}
