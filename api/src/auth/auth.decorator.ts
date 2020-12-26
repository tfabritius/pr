import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const AuthUser = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest()
    // Return the user set by the guard
    return req.user
  },
)
