import { Prisma } from '@prisma/client'

export function parseDecimal({ value }: { value: string }): Prisma.Decimal {
  try {
    return new Prisma.Decimal(value)
  } catch {
    return undefined
  }
}
