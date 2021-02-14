import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import * as AdmZip from 'adm-zip'
import axios from 'axios'
import { existsSync } from 'fs'
import * as ip2loc from 'ip2location-nodejs'
import * as util from 'util'

@Injectable()
export class GeoIpService implements OnModuleInit {
  private readonly logger = new Logger(GeoIpService.name)

  private initialized = false

  private readonly dbDir = 'ip2location/'
  private readonly dbPath = this.dbDir + 'IP2LOCATION-LITE-DB1.IPV6.BIN'

  async onModuleInit() {
    // load db in background, no await!
    this.loadIp2LocationDb()
  }

  async loadIp2LocationDb() {
    if (!existsSync(this.dbPath)) {
      await this.updateIp2LocationDb()
    }

    if (existsSync(this.dbPath)) {
      try {
        this.logger.log('Loading database...')
        ip2loc.IP2Location_init(this.dbPath)
        this.initialized = true
        this.logger.log('Initialized database.')
      } catch (err) {
        this.logger.error('Could not load database.')
        this.logger.error(util.inspect(err))
      }
    }
  }

  async updateIp2LocationDb() {
    const file = 'DB1LITEBINIPV6'
    const token = process.env.IP2LOCATION_TOKEN

    if (!token) {
      this.logger.warn('Cannot download database, no token provided.')
      this.logger.warn('Will continue to work without GeoIP data.')
      return
    }

    const url = `https://www.ip2location.com/download/?token=${token}&file=${file}`

    try {
      this.logger.log('Downloading database...')
      const downloadResponse = await axios.get(url, {
        responseType: 'arraybuffer',
      })

      const size = downloadResponse.data.length

      if (size < 100000) {
        this.logger.warn(`Database is too small (${size} bytes).`)
        this.logger.debug(
          'Content: ' +
            new TextDecoder('utf8').decode(
              downloadResponse.data.slice(0, 1000),
            ),
        )
        this.logger.warn('Will continue to work without GeoIP data.')
        return
      }

      this.logger.log('Extracting files...')
      const zip = new AdmZip(downloadResponse.data)

      zip.extractAllTo(this.dbDir, true) // overwrite if needed

      this.logger.log('done.')
    } catch (err) {
      this.logger.error('Could not download database.')
      this.logger.error(util.inspect(err))
    }
  }

  getCountryFromIp(ip: string): string {
    return this.initialized ? ip2loc.IP2Location_get_country_short(ip) : ''
  }
}
