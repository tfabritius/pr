import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import Fuse from 'fuse.js'

import { PrismaService } from '../prisma.service'
import { generateUuid } from '../utils/uuid'
import { CreateUpdateSecurityDto } from './dto/create.update.security.dto'
import { PublicSecurity } from './dto/public.security.dto'

@Injectable()
export class SecuritiesService implements OnModuleInit {
  private readonly logger = new Logger(SecuritiesService.name)

  constructor(private readonly prisma: PrismaService) {}

  private ftsIndex: Fuse<PublicSecurity>

  async onModuleInit() {
    // create index in background, no await!
    this.updateFtsIndex()
  }

  /**
   * Creates/updates the full text search index
   */
  async updateFtsIndex() {
    this.logger.log('Creating/updating full text search index...')

    const securities = await this.prisma.security.findMany({
      select: {
        uuid: true,
        name: true,
        isin: true,
        wkn: true,
        symbolXfra: true,
        symbolXnas: true,
        symbolXnys: true,
        securityType: true,
        securityMarkets: {
          select: {
            marketCode: true,
            symbol: true,
            firstPriceDate: true,
            lastPriceDate: true,
            currencyCode: true,
          },
        },
      },
    })

    const entriesWithDateOnly = securities.map(({ securityMarkets, ...s }) => ({
      ...s,
      uuid: s.uuid?.replace(/-/g, ''),
      markets: securityMarkets.map((m) => ({
        ...m,
        firstPriceDate: m.firstPriceDate?.toISOString().substring(0, 10),
        lastPriceDate: m.lastPriceDate?.toISOString().substring(0, 10),
      })),
    }))

    const options: Fuse.IFuseOptions<PublicSecurity> = {
      includeScore: true,
      shouldSort: true,
      minMatchCharLength: 2,
      keys: [
        'name',
        'isin',
        'wkn',
        'symbolXnas',
        'symbolXnys',
        'markets.symbol',
      ],
    }
    const fts = new Fuse(entriesWithDateOnly, options)

    this.ftsIndex = fts
    this.logger.log('Full text search index created.')
  }

  /**
   * Searches full text search index
   *
   * Throws ServiceUnavailableException if index is not ready (yet)
   */
  searchFtsIndex(query: string): Array<Fuse.FuseResult<PublicSecurity>> {
    if (!this.ftsIndex) {
      throw new ServiceUnavailableException('Service unavailable')
    }

    return this.ftsIndex.search(query)
  }

  async create(security: CreateUpdateSecurityDto) {
    const uuid = generateUuid()
    this.logger.log(`Creating ${uuid}`)
    return await this.prisma.security.create({
      data: { ...security, uuid },
    })
  }

  async update(uuid: string, security: CreateUpdateSecurityDto) {
    this.logger.log(`Updating ${uuid}`)
    return await this.prisma.security.update({
      data: security,
      where: { uuid },
    })
  }

  async delete(uuid: string) {
    this.logger.log(`Deleting ${uuid}`)
    return await this.prisma.security.delete({ where: { uuid } })
  }

  async getOne(uuid: string) {
    const security = await this.prisma.security.findUnique({
      where: { uuid },
      include: {
        events: true,
        securityMarkets: true,
        securityTaxonomies: true,
      },
    })

    if (!security) {
      throw new NotFoundException('Security not found')
    }

    return security
  }

  async getOnePublic(uuid: string) {
    const security = await this.prisma.security.findUnique({
      where: { uuid },
      select: {
        uuid: true,
        name: true,
        isin: true,
        wkn: true,
        symbolXfra: true,
        symbolXnas: true,
        symbolXnys: true,
        securityType: true,
        securityMarkets: {
          select: {
            marketCode: true,
            currencyCode: true,
            firstPriceDate: true,
            lastPriceDate: true,
            symbol: true,
          },
        },
        securityTaxonomies: {
          select: {
            weight: true,
            taxonomyUuid: true,
          },
        },
        events: {
          select: {
            date: true,
            type: true,
            amount: true,
            currencyCode: true,
            ratio: true,
          },
          where: {
            OR: [{ type: 'dividend' }, { type: 'split' }],
          },
        },
      },
    })

    if (!security) {
      throw new NotFoundException('Security not found')
    }

    return security
  }

  async getMany({
    limit,
    skip,
    sort,
    descending,
    search,
    securityType,
  }: {
    limit: number
    skip: number
    sort: string
    descending: boolean
    search: string
    securityType: string
  }) {
    this.logger.log(
      `Getting entries, limit: ${limit}, skip: ${skip}, ` +
        `sort: ${sort}, desc: ${descending}, search: ${search}, ` +
        `securityType: ${securityType}`,
    )

    const filters: Prisma.SecurityWhereInput[] = []

    // Add filter based on search text
    if (search) {
      if (
        search.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        )
      ) {
        filters.push({
          uuid: {
            equals: search,
          },
        })
      } else {
        filters.push({
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { isin: { equals: search, mode: 'insensitive' } },
            { wkn: { equals: search, mode: 'insensitive' } },
            { symbolXfra: { equals: search, mode: 'insensitive' } },
            { symbolXnas: { equals: search, mode: 'insensitive' } },
            { symbolXnys: { equals: search, mode: 'insensitive' } },
          ],
        })
      }
    }

    // Add filter based on securityType
    if (securityType) {
      filters.push({ securityType })
    }

    const where: Prisma.SecurityWhereInput = { AND: filters }

    const totalCount = await this.prisma.security.count({ where })

    const entries = await this.prisma.security.findMany({
      where,
      orderBy: { [sort]: descending ? 'desc' : 'asc' },
      take: limit,
      skip,
      include: {
        securityMarkets: {
          select: {
            marketCode: true,
            currencyCode: true,
            firstPriceDate: true,
            lastPriceDate: true,
            symbol: true,
            updatePrices: true,
          },
        },
        events: {
          select: {
            date: true,
            type: true,
            amount: true,
            currencyCode: true,
            ratio: true,
          },
          where: { OR: [{ type: 'dividend' }, { type: 'split' }] },
        },
      },
    })

    return { entries, params: { totalCount } }
  }
}
