import { generateUuid } from './uuid'

test('generateUuid', () => {
  expect(typeof generateUuid()).toBe('string')
  expect(generateUuid()).not.toBe(generateUuid())
})
