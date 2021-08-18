import { ForbiddenException } from '@nestjs/common'
import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql'

export const permitAdminMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  if (!ctx.context.req.user.isAdmin) {
    throw new ForbiddenException(
      `Access to ${ctx.info.fieldName} of ${ctx.info.parentType} is forbidden.`,
    )
  }

  return next()
}
