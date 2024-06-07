interface BoardTopology {
    /**
     * Each coord is identified by an integer.
     * Each coord has a list of neighbors.
     */
    readonly neighbors: ReadonlyArray<ReadonlyArray<number>>
}

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
    coord: Coord
    contents: SpotContents
}

export interface Board {
    topology: BoardTopology
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
    spots: [
        { coord: { id: 0, x: 0, y: 0 }, contents: { owner: 0, pop: 1, terrain: "land" } },
        { coord: { id: 1, x: 1, y: 0 }, contents: { owner: 0, pop: 1, terrain: "land" } },
        { coord: { id: 2, x: 0, y: 1 }, contents: { owner: 0, pop: 1, terrain: "land" } },
        { coord: { id: 3, x: 1, y: 1 }, contents: { owner: 0, pop: 1, terrain: "land" } },
    ],
})