import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Portfolio } from './portfolio.entity'
import { PortfoliosService } from './portfolios.service'
import { PortfoliosController } from './portfolios.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Portfolio])],
  providers: [PortfoliosService],
  controllers: [PortfoliosController],
})
export class PortfoliosModule {}
