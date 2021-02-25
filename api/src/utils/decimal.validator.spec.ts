import { Prisma } from '@prisma/client'
import { validate } from 'class-validator'

import { IsValidDecimal } from './decimal.validator'

class TestClass {
  constructor(value) {
    this.value = value
  }

  @IsValidDecimal()
  value: unknown
}

describe('@IsValidDecimal', () => {
  it('passes on valid Decimal', async () => {
    const res = await validate(new TestClass(new Prisma.Decimal('1.23')))
    expect(res).toHaveLength(0)
  })

  it('fails on number', async () => {
    const res = await validate(new TestClass(1.23))
    expect(res).toHaveLength(1)
    expect(res[0]).toMatchObject({
      constraints: { isValidDecimal: 'value must be a valid decimal' },
    })
  })

  it('fails on string', async () => {
    const res = await validate(new TestClass('1.23'))
    expect(res).toHaveLength(1)
    expect(res[0]).toMatchObject({
      constraints: { isValidDecimal: 'value must be a valid decimal' },
    })
  })
})
