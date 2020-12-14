import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Security } from './security.entity'
import { SecuritiesService } from './securities.service'
import { SecuritiesKpisService } from './securities.kpis.service'
import { SecuritiesController } from './securities.controller'
import { PortfoliosModule } from '../portfolios.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Security]),
    forwardRef(() => PortfoliosModule),
  ],
  providers: [SecuritiesService, SecuritiesKpisService],
  controllers: [SecuritiesController],
  exports: [SecuritiesService],
})
export class SecuritiesModule {}
