import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext, GqlContextType } from '@nestjs/graphql'

export const UserAgent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    if (ctx.getType<GqlContextType>() === 'graphql') {
      return GqlExecutionContext.create(ctx).getContext().req.headers[
        'user-agent'
      ]
    } else {
      return ctx.switchToHttp().getRequest().headers['user-agent']
    }
  },
)
