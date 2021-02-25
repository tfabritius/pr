import { Prisma } from '@prisma/client'
import { plainToClass, Transform } from 'class-transformer'

import { parseDecimal } from './decimal.parser'

class TestClass {
  @Transform(parseDecimal)
  value: Prisma.Decimal
}

describe('parseDecimal', () => {
  it('parses valid decimal string', () => {
    const testClass = plainToClass(TestClass, { value: '1.23' })
    expect(testClass.value).toBeDefined()
    expect(testClass.value.toString()).toBe('1.23')
  })

  it('parses valid number', () => {
    const testClass = plainToClass(TestClass, { value: 1.23 })
    expect(testClass.value).toBeDefined()
    expect(testClass.value.toString()).toBe('1.23')
  })

  it('parses invalid string', () => {
    const testClass = plainToClass(TestClass, { value: 'abc' })
    expect(testClass.value).toBeUndefined()
  })
})
