import { Module } from '@nestjs/common'

import { StatsController } from './stats.controller'
import { PrismaService } from '../prisma.service'
import { GeoIpService } from './geoip.service'

/**
 * StatsModule
 *
 * This module is used to collect and evalute statistics about
 * automatic updates of Portfolio Performance installations
 */
@Module({
  imports: [],
  providers: [PrismaService, GeoIpService],
  controllers: [StatsController],
  exports: [],
})
export class StatsModule {}
