import { Module } from '@nestjs/common'

import { TaxonomiesController } from './taxonomies.controller'
import { PrismaService } from '../prisma.service'

@Module({
  imports: [],
  providers: [PrismaService],
  controllers: [TaxonomiesController],
  exports: [],
})
export class TaxonomiesModule {}
