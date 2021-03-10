import { matchArrays } from './match-arrays'

describe('matchArrays', () => {
  it('matches numbers', () => {
    const { matches, unmatchedLefts, unmatchedRights } = matchArrays(
      [1, 2, 3, 4, 5, 6],
      [4, 5, 6, 7, 8, 9],
      (a, b) => a === b,
    )
    expect(unmatchedLefts).toStrictEqual([1, 2, 3])
    expect(unmatchedRights).toStrictEqual([7, 8, 9])
    expect(matches).toStrictEqual([
      [4, 4],
      [5, 5],
      [6, 6],
    ])
  })

  it('matches only one of matching numbers on left side', () => {
    const { matches, unmatchedLefts, unmatchedRights } = matchArrays(
      [1, 2, 3, 4, 4],
      [3, 4, 5, 6],
      (a, b) => a === b,
    )
    expect(unmatchedLefts).toStrictEqual([1, 2, 4])
    expect(unmatchedRights).toStrictEqual([5, 6])
    expect(matches).toStrictEqual([
      [3, 3],
      [4, 4],
    ])
  })

  it('matches only one of matching numbers on right side', () => {
    const { matches, unmatchedLefts, unmatchedRights } = matchArrays(
      [1, 2, 3, 4],
      [3, 3, 4, 5, 6],
      (a, b) => a === b,
    )
    expect(unmatchedLefts).toStrictEqual([1, 2])
    expect(unmatchedRights).toStrictEqual([3, 5, 6])
    expect(matches).toStrictEqual([
      [3, 3],
      [4, 4],
    ])
  })
})
