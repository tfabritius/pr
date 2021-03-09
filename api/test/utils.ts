/**
 * Takes an object and creates a list of objects, each missing a single attribute
 */
export function getObjectsWithMissingAttribute<T>(
  object: T,
  attributesToBeRemoved?: string[],
): Array<[string, T]> {
  const ret = []
  attributesToBeRemoved = attributesToBeRemoved ?? Object.keys(object)
  for (const missingAttribute of attributesToBeRemoved) {
    const objectCopy = { ...object }
    delete objectCopy[missingAttribute]
    ret.push([missingAttribute, objectCopy])
  }
  return ret
}
