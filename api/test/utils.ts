/**
 * Takes an object and creates a list of objects, each missing a single attribute
 */
export function getObjectsWithMissingAttribute<T>(
  object: T,
): Array<[string, T]> {
  const ret = []
  for (const missingAttribute of Object.keys(object)) {
    const objectCopy = { ...object }
    delete objectCopy[missingAttribute]
    ret.push([missingAttribute, objectCopy])
  }
  return ret
}
