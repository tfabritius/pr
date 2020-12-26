/**
 * Finds shortest path between all pairs of vertices (all-pairs shortest path, APSP) using Floyd-Warshall algorithm
 *
 * @param vertices list of all vertices
 * @param getEdgeDistance callback that returns the distance between two
 * vertices if they are connected or `undefined` if there is no edge
 *
 * @returns the `distances` between all pairs of vertices (`distances.get(from).get(to)`)
 * @returns the `nextVertex` on the path from `current` to `target` (`nextVertex.get(current).get(target)`)
 */
export function findAllPairsShortestPath<VertexType>(
  vertices: VertexType[],
  getEdgeDistance: (from: VertexType, to: VertexType) => number | undefined,
): {
  distances: Map<VertexType, Map<VertexType, number>>
  nextVertex: Map<VertexType, Map<VertexType, VertexType>>
} {
  const dist = new Map<VertexType, Map<VertexType, number>>()
  const next = new Map<VertexType, Map<VertexType, VertexType>>()

  // Initialize dist and next
  for (const startVertex of vertices) {
    dist.set(startVertex, new Map())
    next.set(startVertex, new Map())

    for (const endVertex of vertices) {
      if (startVertex === endVertex) {
        dist.get(startVertex).set(endVertex, 0)
      } else {
        const d = getEdgeDistance(startVertex, endVertex)
        dist.get(startVertex).set(endVertex, d || Infinity)
        if (d) next.get(startVertex).set(endVertex, endVertex)
      }
    }
  }

  // Floyd-Warshall algorithm
  for (const middle of vertices) {
    for (const start of vertices) {
      for (const end of vertices) {
        const shortcutDist =
          dist.get(start).get(middle) + dist.get(middle).get(end)
        if (dist.get(start).get(end) > shortcutDist) {
          dist.get(start).set(end, shortcutDist)
          next.get(start).set(end, next.get(start).get(middle))
        }
      }
    }
  }

  return {
    distances: dist,
    nextVertex: next,
  }
}
