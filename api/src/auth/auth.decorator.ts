import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext, GqlContextType } from '@nestjs/graphql'

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    if (ctx.getType<GqlContextType>() === 'graphql') {
      return GqlExecutionContext.create(ctx).getContext().req.user
    } else {
      return ctx.switchToHttp().getRequest().user
    }
  },
)
