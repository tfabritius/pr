import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma } from '@prisma/client'
import axios from 'axios'
import Fuse from 'fuse.js'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FuseConstructor = require('fuse.js')

import { PrismaService } from '../prisma.service'
import { generateUuid } from '../utils/uuid'
import { CreateUpdateSecurityDto } from './dto/create.update.security.dto'
import { PublicSecurity } from './dto/public.security.dto'

@Injectable()
export class SecuritiesService implements OnModuleInit {
  private readonly logger = new Logger(SecuritiesService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private ftsIndex: Fuse<PublicSecurity>

  async onModuleInit() {
    // create index in background, no await!
    this.updateFtsIndex()
  }

  /**
   * Reads securities from database and formats them for search output
   */
  async getSecuritiesForSearch(where: Prisma.SecurityWhereInput = {}) {
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
      where,
    })

    return securities.map(({ securityMarkets, ...s }) => ({
      ...s,
      uuid: s.uuid?.replace(/-/g, ''),
      markets: securityMarkets.map((m) => ({
        ...m,
        firstPriceDate: m.firstPriceDate?.toISOString().substring(0, 10),
        lastPriceDate: m.lastPriceDate?.toISOString().substring(0, 10),
      })),
    }))
  }

  /**
   * Creates/updates the full text search index
   */
  async updateFtsIndex() {
    this.logger.log('Creating/updating full text search index...')

    const entriesWithDateOnly = await this.getSecuritiesForSearch()

    const options: Fuse.IFuseOptions<PublicSecurity> = {
      includeScore: true,
      shouldSort: true,
      minMatchCharLength: 2,
      keys: ['name', 'symbolXnas', 'symbolXnys', 'markets.symbol'],
    }
    const fts = new FuseConstructor(entriesWithDateOnly, options)

    this.ftsIndex = fts
    this.logger.log('Full text search index created.')
  }

  /**
   * Searches full text search index
   *
   * Throws ServiceUnavailableException if index is not ready (yet)
   */
  async searchFtsIndex(
    query: string,
    securityType?: string,
  ): Promise<Array<PublicSecurity>> {
    /* Search database if query string looks like a ISIN/WKN */
    const uppercaseQuery = query.trim().toUpperCase()
    if (uppercaseQuery.length === 6 || uppercaseQuery.length === 12) {
      const exactMatches = await this.getSecuritiesForSearch({
        OR: [{ isin: uppercaseQuery }, { wkn: uppercaseQuery }],
      })

      if (exactMatches.length > 0) {
        return exactMatches
      }
    }

    /* Use fuzzy search */
    if (!this.ftsIndex) {
      throw new ServiceUnavailableException('Service unavailable')
    }

    const rawResults = this.ftsIndex.search(query)

    const results: PublicSecurity[] = []

    const minResults =
      this.config.get<number>('SECURITIES_SEARCH_MIN_RESULTS') || 10
    const maxScore =
      this.config.get<number>('SECURITIES_SEARCH_MAX_SCORE') || 0.001

    for (const searchResult of rawResults) {
      // Stop looping through list of results, if...
      if (
        (!searchResult.score || searchResult.score > maxScore) && // no more results below threshold score
        results.length >= minResults // and minimum number of results is reached
      ) {
        break
      }

      // Add search result if filter on security matches (if given)
      if (!securityType || searchResult.item.securityType === securityType) {
        results.push(searchResult.item)
      }
    }

    return results
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

  /**
   * Creates or updates security retrieved from proxy
   */
  async createFromProxy(uuid: string, proxy: string) {
    this.logger.log(`Retrieving ${uuid} from proxy ${proxy}`)

    try {
      const { data: security } = await axios.get<{
        uuid: string
        name: string
        isin: string
        wkn: string
        securityType: string
        markets: Array<{
          marketCode: string
          currencyCode: string
          symbol: string
        }>
      }>(`${proxy}/securities/uuid/${uuid}`)

      await this.prisma.security.create({
        data: {
          uuid: security.uuid,
          name: security.name,
          isin: security.isin,
          wkn: security.wkn,
          securityType: security.securityType,
          securityMarkets: {
            createMany: {
              data: security.markets.map((e) => ({
                marketCode: e.marketCode,
                currencyCode: e.currencyCode,
                symbol: e.symbol,
                updatePrices: false,
              })),
            },
          },
        },
      })
    } catch (e) {
      this.logger.error(`Couldn't create security ${uuid} from proxy`)
      this.logger.error(e.stack)
    }

    this.logger.log(`Security ${uuid} created.`)
  }

  async delete(uuid: string) {
    this.logger.log(`Deleting ${uuid}`)

    const security = await this.getOne(uuid)
    await this.prisma.$executeRaw`DELETE FROM securities WHERE uuid=${uuid}`
    return security
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
            taxonomy: { select: { rootUuid: true } },
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

    const securityWithFlatTaxonomies = {
      ...security,
      securityTaxonomies: security.securityTaxonomies.map(
        ({ taxonomy, ...e }) => ({
          ...e,
          rootTaxonomyUuid: taxonomy.rootUuid,
        }),
      ),
    }

    return securityWithFlatTaxonomies
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
