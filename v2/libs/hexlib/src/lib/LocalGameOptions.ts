export interface LocalGameOptions {
    // All numbers because our reducer assumes it.
    // If we need a non-number, the reducer should be easy to modify.
    numRobots: number
    tickMillis: number // how long is a turn? default 500
    roundTicks: number // how many turns in a round? Default 50
    cityTicks: number // how often does city pop grow? Default 2
    boardWidth: number
    boardHeight: number
    mountainPercent: number
    difficulty: number
    startingPop: number

    // booleans
    fog: number
    // Players start with capitals (true) or towns (false)?
    // Note that capturing a capital captures whole territory, but town does not.
    capitals: number
    statsVisible: number // changes shape of board
    levelVisible: number // advanced options visible?
    syncedGrowth: number // tiles grow all at once (true) or based on when they were captured (false)
    randomStart: number // players start in random locations?

    // allow indexing
    // [key: LGOKey]: number
}

export const DEFAULT_LOCAL_GAME_OPTIONS: LocalGameOptions = Object.freeze({
    numRobots: 5,
    boardWidth: 7,
    boardHeight: 21,
    difficulty: 2,
    mountainPercent: 25,
    tickMillis: 500,
    roundTicks: 50,
    cityTicks: 2,
    startingPop: 0,
    // booleans — non-zero is true
    fog: 1,
    capitals: 1,
    syncedGrowth: 1,
    // meta
    statsVisible: 1, // 0, // 1,
    levelVisible: 0, // what options are visible
    randomStart: 1, // used in testing
})

export const MIN_MAP_SIZE = 50
// const DEFAULT_HEXES_PER_PLAYER = 'A few'

// hexes can get too small, especially for touch
// but this doesn't work very well because browsers report such a wide variety of resolutions
export const MIN_PIXELS_PER_HEX = 800

// this seems like an over simplification, but I haven't found anything better.
// note that tablets get the higher number
// export const maxMapSize = (): number => (isMobile() ? 250 : 400)
export const maxMapSize = 400

// const DEFAULT_DIFFICULTY = '2'

// number of hexes per player
// const playerDensities = Map<string, number>([
//     ['Tons', 6],
//     ['Lots', 12],
//     ['Many', 24],
//     [DEFAULT_HEXES_PER_PLAYER, 48],
//     ['Not many', 96],
//     ['Very few', 192],
//     ['None', Infinity],
// ])

export const LGO_DIFFICULTY_NAMES = Object.freeze([
    "Easy",
    "Easy",
    "Basic",
    "Basic",
    "Medium",
    "Medium",
    "Tough",
    "Hard",
])

// "Index types" — typescriptlang.org/docs/handbook/advanced-types.html
export type LGOKey = keyof LocalGameOptions

export const LGO_LIMITS = new Map<LGOKey, [number, number]>([
    ["numRobots", [0, 15]],
    ["difficulty", [0, BasicRobot.MAX_IQ]],
    ["boardWidth", [1, 45]],
    ["boardHeight", [2, 21]],
    ["mountainPercent", [0, 50]],
    ["tickMillis", [1, 9999]],
    ["startingPop", [0, 999]],
    ["roundTicks", [1, 9999]],
])
