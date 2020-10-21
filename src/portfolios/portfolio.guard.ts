import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common'

import { PortfoliosService } from './portfolios.service'

/**
 * Checks if the portfolio (identified by parameter "portfolioId")
 * exists and if the logged in user is allowed to access it
 * or throws NotFoundException.
 */
@Injectable()
export class PortfolioGuard implements CanActivate {
  constructor(
    @Inject('PortfoliosService')
    private readonly portfoliosService: PortfoliosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const user = req.user
    const params = req.params

    if (!user || !params || !params.portfolioId) {
      throw new InternalServerErrorException(
        'PortfolioGuard is missing user or portfolio parameters.',
      )
    }

    // Check if portfolio can be obtained by user or throw Exception
    await this.portfoliosService.getOneOfUser(user, req.params)

    return true
  }
}
