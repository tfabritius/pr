import { UseGuards } from '@nestjs/common'
import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'

import { Account } from './account.entity'
import { AccountsService } from './accounts.service'
import { AccountsKpisService } from './accounts.kpis.service'
import { AuthUser } from '../../auth/auth.decorator'
import { User } from '../../auth/users/user.entity'
import { GqlAuthGuard } from '../../auth/gql-auth.guard'
import { PortfoliosService } from '../portfolios.service'

@Resolver(() => Account)
@UseGuards(GqlAuthGuard)
export class AccountsResolver {
  constructor(
    private portfoliosService: PortfoliosService,
    private accountsService: AccountsService,
    private accountsKpisService: AccountsKpisService,
  ) {}

  @Query(() => [Account])
  async accounts(
    @Args('portfolioId', { type: () => Int }) portfolioId: number,
    @Args('type', { type: () => String, nullable: true }) type: string,
    @AuthUser() user: User,
  ) {
    await this.portfoliosService.getOneOfUser(user, { portfolioId })
    const accounts = await this.accountsService.getAll({ portfolioId })
    if (type) return accounts.filter((a) => a.type === type)
    else return accounts
  }

  @ResolveField(() => String)
  async balance(@Parent() account: Account) {
    const kpis = await this.accountsKpisService.getKpis(account, {
      baseCurrencyCode: 'EUR',
    })
    return kpis.balance
  }
}
