import { findAllPairsShortestPath } from './floyd.warshall'

describe('findAllPairsShortestPath', function () {
  test('undirected graph with 3 vertices and 2 edges', () => {
    const vertex1 = { i: 0 }
    const vertex2 = { i: 1 }
    const vertex3 = { i: 2 }
    const vertices = [vertex1, vertex2, vertex3]

    function getEdgeDistance(from, to) {
      const m = [
        [0, 1, undefined],
        [1, 0, 1],
        [undefined, 1, 0],
      ]
      return m[from.i][to.i]
    }

    const res = findAllPairsShortestPath(vertices, getEdgeDistance)

    expect(res.distances.get(vertex1).get(vertex1)).toBe(0)
    expect(res.distances.get(vertex1).get(vertex2)).toBe(1)
    expect(res.distances.get(vertex1).get(vertex3)).toBe(2)
    expect(res.distances.get(vertex2).get(vertex1)).toBe(1)
    expect(res.distances.get(vertex2).get(vertex2)).toBe(0)
    expect(res.distances.get(vertex2).get(vertex3)).toBe(1)
    expect(res.distances.get(vertex3).get(vertex1)).toBe(2)
    expect(res.distances.get(vertex3).get(vertex2)).toBe(1)
    expect(res.distances.get(vertex3).get(vertex3)).toBe(0)

    expect(res.nextVertex.get(vertex1).get(vertex1)).toBe(undefined)
    expect(res.nextVertex.get(vertex1).get(vertex2)).toBe(vertex2)
    expect(res.nextVertex.get(vertex1).get(vertex3)).toBe(vertex2)
    expect(res.nextVertex.get(vertex2).get(vertex1)).toBe(vertex1)
    expect(res.nextVertex.get(vertex2).get(vertex2)).toBe(undefined)
    expect(res.nextVertex.get(vertex2).get(vertex3)).toBe(vertex3)
    expect(res.nextVertex.get(vertex3).get(vertex1)).toBe(vertex2)
    expect(res.nextVertex.get(vertex3).get(vertex2)).toBe(vertex2)
    expect(res.nextVertex.get(vertex3).get(vertex3)).toBe(undefined)
  })

  test('undirected graph with 8 vertices and 12 edges', () => {
    const vertices = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

    function getEdgeDistance(from, to) {
      const edges = {
        AB: 4,
        AC: 3,
        AE: 7,
        BC: 6,
        BD: 5,
        CD: 11,
        CE: 8,
        DE: 2,
        DF: 2,
        DG: 10,
        EG: 5,
        FG: 3,
      }
      if (from + to in edges) return edges[from + to]
      if (to + from in edges) return edges[to + from]
      return undefined
    }

    const res = findAllPairsShortestPath(vertices, getEdgeDistance)

    expect(res.distances.get('A').get('A')).toBe(0)
    expect(res.distances.get('A').get('B')).toBe(4)
    expect(res.distances.get('A').get('C')).toBe(3)
    expect(res.distances.get('A').get('D')).toBe(9)
    expect(res.distances.get('A').get('E')).toBe(7)
    expect(res.distances.get('A').get('F')).toBe(11)
    expect(res.distances.get('A').get('G')).toBe(12)
    expect(res.distances.get('A').get('H')).toBe(Infinity)

    expect(res.nextVertex.get('A').get('A')).toBe(undefined)
    expect(res.nextVertex.get('A').get('B')).toBe('B')
    expect(res.nextVertex.get('A').get('C')).toBe('C')

    expect(res.nextVertex.get('A').get('D')).toBe('B')
    expect(res.nextVertex.get('B').get('D')).toBe('D')

    expect(res.nextVertex.get('A').get('F')).toBe('B')
    expect(res.nextVertex.get('B').get('F')).toBe('D')
    expect(res.nextVertex.get('D').get('F')).toBe('F')

    expect(res.nextVertex.get('A').get('G')).toBe('E')
    expect(res.nextVertex.get('E').get('G')).toBe('G')

    expect(res.nextVertex.get('A').get('H')).toBe(undefined)
  })
})
