import { Get, Controller, Param, Req, Head } from '@nestjs/common'
import {
  ApiTags,
  ApiInternalServerErrorResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger'
import { Request } from 'express'

import { PrismaService } from '../prisma.service'
import { GeoIpService } from './geoip.service'
import {
  StatsVersionDetailsResponseDto,
  StatsVersionResponseDto,
} from './stats.dto'

@Controller('stats')
@ApiTags('stats')
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
export class StatsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geoip: GeoIpService,
  ) {}

  /**
   * Counts request (GET or HEAD) as update to a certain version
   */
  @Head('/update/name.abuchen.portfolio/:version')
  @Get('/update/name.abuchen.portfolio/:version')
  @ApiExcludeEndpoint()
  async saveUpdate(@Param('version') version: string, @Req() req: Request) {
    const country = this.geoip.getCountryFromIp(req.ip)
    const timestamp = new Date()
    const useragent = req.headers['user-agent']

    await this.prisma.clientupdate.create({
      data: { timestamp, version, country, useragent },
    })
  }

  /**
   * Gets statistics on updates of all versions
   */
  @Get('/updates')
  async getStatistics(): Promise<StatsVersionResponseDto[]> {
    const versions = await this.prisma.clientupdate.groupBy({
      by: ['version'],
      count: { _all: true },
      min: { timestamp: true },
      max: { timestamp: true },
    })

    return versions.map((el) => ({
      version: el.version,
      count: el.count._all,
      firstUpdate: el.min.timestamp,
      lastUpdate: el.max.timestamp,
    }))
  }

  /**
   * Gets statistics on updates to a certain version
   */
  @Get('/updates/:version')
  async getStatisticsVersion(
    @Param('version') version: string,
  ): Promise<StatsVersionDetailsResponseDto> {
    const byDate = await this.prisma.$queryRaw<
      { date: string; count: number }[]
    >`
      SELECT date(timestamp) AS date, count(*) AS count
      FROM clientupdates
      WHERE version = ${version}
      GROUP BY date
      ORDER BY date ASC;`

    const byCountry = await this.prisma.$queryRaw<
      { country: string; count: number }[]
    >`
      SELECT COALESCE(country, '') AS country, count(*) AS count
      FROM clientupdates
      WHERE version = ${version}
      GROUP BY country;`

    const ret = { byDate, byCountry }
    return ret
  }
}
