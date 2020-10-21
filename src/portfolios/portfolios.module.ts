import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Portfolio } from './portfolio.entity'
import { PortfoliosService } from './portfolios.service'

@Module({
  imports: [TypeOrmModule.forFeature([Portfolio])],
  providers: [PortfoliosService],
})
export class PortfoliosModule {}
