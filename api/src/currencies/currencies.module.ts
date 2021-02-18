import { Module } from '@nestjs/common'

import { CurrenciesService } from './currencies.service'
import { CurrenciesConversionService } from './currencies.conversion.service'
import { CurrenciesController } from './currencies.controller'
import { PrismaService } from '../prisma.service'

@Module({
  imports: [],
  providers: [CurrenciesService, CurrenciesConversionService, PrismaService],
  controllers: [CurrenciesController],
  exports: [CurrenciesService, CurrenciesConversionService],
})
export class CurrenciesModule {}
