/**
 * Each coord is identified by an integer.
 * Each coord has an x-y location on the board, which is purely cosmetic.
 */
interface Coord {
    /** Unique ID of the coordinate. */
    id: number
    /** Cosmetic x-position of the coordinate. */
    x: number
    /** Cosmetic y-position of the coordinate. */
    y: number
}

interface BoardTopology {
    /**
     * Each coord is identified by an integer.
     * Each coord has a list of neighbors.
     * Note that the top level (list of coord IDs) is sparse; use for ... in to iterate.
     */
    readonly neighbors: ReadonlyArray<ReadonlyArray<number>>
}

interface BoardGeometry {
    /** A board's spatial locations; topology is derived from it via a Voronoi diagram. */
    readonly locations: ReadonlyArray<Coord>
}

type Terrain = "land" | "mountain" | "city" | "capital"

interface SpotContents {
    /** The player who owns the spot. */
    owner: number
    /** Population of the spot. */
    pop: number
    /** Terrain on the spot. */
    terrain: Terrain
}

/** A position on a playing board. */
interface Spot {
    /** The coord of the spot. */
    locationId: number
    contents: SpotContents
}

export interface Board {
    topology: BoardTopology
    geometry: BoardGeometry
    spots: ReadonlyArray<Spot>
}

export const createDumbBoard: () => Board = () => ({
    topology: {
        neighbors: [
            [1, 2, 3],
            [0, 2, 3],
            [0, 1, 3],
            [0, 1, 2],
        ],
    },
    geometry: {
        locations: [
            { id: 0, x: 0, y: 0 },
            { id: 1, x: 1, y: 0 },
            { id: 2, x: 0, y: 1 },
            { id: 3, x: 1, y: 1 },
        ],
    },
    spots: [
        { locationId: 0, contents: { owner: 0, pop: 1, terrain: "land" } },
        { locationId: 1, contents: { owner: 0, pop: 50, terrain: "city" } },
        { locationId: 2, contents: { owner: 0, pop: 1, terrain: "mountain" } },
        { locationId: 3, contents: { owner: 1, pop: 4, terrain: "capital" } },
    ],
})

const emptyNumbers: ReadonlyArray<number> = []

/** Neighbors of a spot, up to a distance of `depth`, in index order. */
export const neighbors = (spotId: number, topology: BoardTopology, depth: number, visited?: Set<Number>): ReadonlyArray<number> => {
    if (depth === 0) return emptyNumbers
    if (depth === 1) return topology.neighbors[spotId] || emptyNumbers
    else {
        const result = []
        const visitedLocal = visited || new Set<number>()
        for (const neighbor of topology.neighbors[spotId] || emptyNumbers) {
            if (!visitedLocal.has(neighbor)) {
                visitedLocal.add(neighbor)
                result.push(...neighbors(neighbor, topology, depth - 1, visitedLocal))
            }
        }
        const unique = new Set(result)
        unique.delete(spotId)
        return [...unique.values()].sort()
    }
}

/** What spots are visible to a player, given a view distance? */
export const visibleSpots = (board: Board, player: number, viewDistance: number = 1): Board => {
    const visibleSpots = board.spots.filter(spot => {
        if (spot.contents.owner === player) return true
        const result = neighbors( spot.locationId, board.topology, viewDistance)
        return result.some(id => board.spots[id]!.contents.owner === player)
    })
    return { ...board, spots: visibleSpots }
}