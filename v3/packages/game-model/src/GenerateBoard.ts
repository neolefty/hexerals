import { Board } from "./Board"

const createRectangularBoard = (width: number, height: number): Board => {
    const locations = []
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            locations.push({id: y * width + x, x, y})
        }
    }
    const neighbors = locations.map((_, i) => {
        const x = i % width
        const y = Math.floor(i / width)
        return [
            y > 0 ? i - width : undefined,
            x < width - 1 ? i + 1 : undefined,
            y < height - 1 ? i + width : undefined,
            x > 0 ? i - 1 : undefined,
        ].filter((n): n is number => n !== undefined)
    })
    return {
        topology: {neighbors},
        geometry: {locations},
        spots: locations.map(({id}) => ({locationId: id, contents: {owner: 0, pop: 0, terrain: "land"}})),
    }
}

export const createDumbBoard: () => Board = () => ({
    topology: {
        neighbors: [
            [1, 2], // neighbors of 0 @ 0, 0
            [0, 3], // neighbors of 1 @ 1, 0
            [0, 3], // neighbors of 2 @ 0, 1
            [1, 2], // neighbors of 3 @ 1, 1
        ],
    },
    geometry: {
        locations: [
            {id: 0, x: 0, y: 0},
            {id: 1, x: 1, y: 0},
            {id: 2, x: 0, y: 1},
            {id: 3, x: 1, y: 1},
        ],
    },
    spots: [
        {locationId: 0, contents: {owner: 0, pop: 1, terrain: "land"}},
        {locationId: 1, contents: {owner: 0, pop: 50, terrain: "city"}},
        {locationId: 2, contents: {owner: 0, pop: 1, terrain: "mountain"}},
        {locationId: 3, contents: {owner: 1, pop: 4, terrain: "capital"}},
    ],
})