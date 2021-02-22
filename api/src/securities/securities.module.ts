import { Module } from '@nestjs/common'

import { PrismaService } from '../prisma.service'
import { SecuritiesService } from './securities.service'
import { SecuritiesController } from './securities.controller'
import { SecurityMarketsService } from './markets.service'

@Module({
  imports: [],
  providers: [PrismaService, SecuritiesService, SecurityMarketsService],
  controllers: [SecuritiesController],
  exports: [SecuritiesService],
})
export class SecuritiesModule {}
