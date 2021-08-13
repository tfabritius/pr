import {
  Injectable,
  CanActivate,
  ExecutionContext,
  InternalServerErrorException,
  NotFoundException,
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
    private readonly portfoliosService: PortfoliosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const user = req.user
    const params = req.params

    if (
      !user ||
      !params ||
      !params.portfolioId ||
      typeof params.portfolioId !== 'string'
    ) {
      throw new InternalServerErrorException(
        'PortfolioGuard is missing user or portfolio parameters.',
      )
    }

    if (isNaN(params.portfolioId)) {
      throw new NotFoundException('Portfolio not found')
    }

    // Check if portfolio can be obtained by user or throw Exception
    const p = await this.portfoliosService.getOneOfUser(user, {
      portfolioId: Number(req.params.portfolioId),
    })

    // Store portfolio in request
    req.portfolio = p

    return true
  }
}
