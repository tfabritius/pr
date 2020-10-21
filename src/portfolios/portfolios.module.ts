import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Portfolio } from './portfolio.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Portfolio])],
})
export class PortfoliosModule {}
