import {
  Injectable,
  OnModuleInit,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common'
import * as AdmZip from 'adm-zip'
import axios from 'axios'
import { existsSync } from 'fs'
import { IP2Location } from 'ip2location-nodejs'
import * as util from 'util'

@Injectable()
export class GeoIpService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GeoIpService.name)

  private ip2loc
  private initialized = false

  private readonly dbDir = 'ip2location/'
  private readonly dbPath = this.dbDir + 'IP2LOCATION-LITE-DB1.IPV6.BIN'

  async onModuleInit() {
    this.ip2loc = new IP2Location()

    // load db in background, no await!
    this.loadIp2LocationDb()
  }

  async onModuleDestroy() {
    await this.ip2loc.close()
  }

  async loadIp2LocationDb() {
    if (!existsSync(this.dbPath)) {
      await this.updateIp2LocationDb()
    }

    if (existsSync(this.dbPath)) {
      try {
        this.logger.log('Loading database...')
        this.ip2loc.open(this.dbPath)
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
      const downloadResponse = await axios.get<Buffer>(url, {
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
    return this.initialized ? this.ip2loc.getCountryShort(ip) : ''
  }
}
