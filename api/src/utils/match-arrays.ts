/**
 * Matches elements of two arrays using an arbitrary predicate.
 * Returns matches and the unmatched remainder of both arrays.
 */
export function matchArrays<LeftType, RightType>(
  lefts: LeftType[],
  rights: RightType[],
  predicate: (left: LeftType, right: RightType) => boolean,
): {
  matches: Array<[LeftType, RightType]>
  unmatchedLefts: LeftType[]
  unmatchedRights: RightType[]
} {
  const unmatchedLefts = []
  const unmatchedRights = [...rights]
  const matches: Array<[LeftType, RightType]> = []

  for (const left of lefts) {
    const idx = unmatchedRights.findIndex((right) => predicate(left, right))

    if (idx !== -1) {
      matches.push([left, unmatchedRights[idx]])

      unmatchedRights.splice(idx, 1)
    } else {
      unmatchedLefts.push(left)
    }
  }

  return { matches, unmatchedLefts, unmatchedRights }
}
