import { validate } from 'class-validator'
import * as dayjs from 'dayjs'

import { IsValidDayjs } from './dayjs.validators'

class TestClass {
  constructor(date) {
    this.date = date
  }

  @IsValidDayjs()
  date: unknown
}

describe('@IsValidDayjs', () => {
  it('passes on valid dayjs date', async () => {
    const res = await validate(new TestClass(dayjs('2020-12-01')))
    expect(res).toHaveLength(0)
  })

  it('fails invalid dayjs date', async () => {
    const res = await validate(new TestClass(dayjs('foo')))
    expect(res).toHaveLength(1)
    expect(res[0]).toMatchObject({
      constraints: { isValidDayjs: 'date must be a valid date' },
    })
  })

  it('fails on string', async () => {
    const res = await validate(new TestClass('2020-12-01'))
    expect(res).toHaveLength(1)
    expect(res[0]).toMatchObject({
      constraints: { isValidDayjs: 'date must be a valid date' },
    })
  })
})
