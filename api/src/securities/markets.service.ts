import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'

import { PrismaService } from '../prisma.service'
import { CreateUpdateSecurityMarketDto } from './dto/create.update.security.market.dto'

@Injectable()
export class SecurityMarketsService {
  private readonly logger = new Logger(SecurityMarketsService.name)

  constructor(private readonly prisma: PrismaService) {}

  async upsert(
    securityUuid: string,
    marketCode: string,
    dto: CreateUpdateSecurityMarketDto,
  ) {
    this.logger.log(`Creating/updating market ${securityUuid}/${marketCode}`)

    const { currencyCode, symbol, updatePrices, prices } = dto

    try {
      const market = await this.prisma.securityMarket.upsert({
        create: {
          securityUuid,
          marketCode,
          currencyCode: currencyCode || '',
          symbol,
          updatePrices: updatePrices ?? true,
        },
        update: {
          updatePrices,
          currencyCode,
          symbol,
        },
        where: {
          securities_markets_security_uuid_market_code: {
            marketCode,
            securityUuid,
          },
        },
      })

      // Create/update the associated prices
      if (prices) {
        await this.prisma.$executeRaw(
          'INSERT INTO securities_markets_prices (security_market_id, date, close) VALUES' +
            prices
              .map((price) => `(${market.id}, '${price.date}', ${price.close})`)
              .join(',') +
            'ON CONFLICT(security_market_id, date) DO UPDATE SET close=excluded.close',
        )
      }

      // Keep firstPriceDate and lastPriceDate up-to-date
      await this.prisma.$executeRaw`
          UPDATE securities_markets SET
          first_price_date = (SELECT MIN(date) FROM securities_markets_prices WHERE security_market_id = ${market.id}),
          last_price_date =  (SELECT MAX(date) FROM securities_markets_prices WHERE security_market_id = ${market.id})
          WHERE id = ${market.id}`
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
      throw new InternalServerErrorException(err)
    }

    return { status: 'ok' }
  }

  async delete(uuid: string, marketCode: string) {
    this.logger.log(`Deleting market ${uuid}/${marketCode}`)

    return await this.prisma.securityMarket.delete({
      where: {
        securities_markets_security_uuid_market_code: {
          marketCode,
          securityUuid: uuid,
        },
      },
    })
  }
}
