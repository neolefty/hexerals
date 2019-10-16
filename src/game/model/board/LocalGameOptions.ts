export interface LocalGameOptions {
    // All numbers because our reducer assumes it.
    // If we need a non-number, the reducer should be easy to modify.
    numRobots: number
    tickMillis: number  // how long is a turn? default 500
    roundTicks: number  // how many turns in a round? Default 50
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
    statsVisible: number  // changes shape of board
    levelVisible: number  // advanced options visible?
    syncedGrowth: number // tiles grow all at once (true) or based on when they were captured (false)
    randomStart: number  // players start in random locations?

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
    // booleans — non-zero is true
    fog: 1,
    capitals: 1,
    syncedGrowth: 1,
    // meta
    statsVisible: 1, // 0, // 1,
    levelVisible: 0,  // what options are visible
    randomStart: 1,  // used in testing
})

const STORE_KEY = "localGameOptions"

export const restoreLocalGameOptions = (): Partial<LocalGameOptions> => {
    const saved = localStorage.getItem(STORE_KEY)
    if (saved) {
        try {
            // console.log(JSON.parse(saved))
            return JSON.parse(saved)
        } catch(e) {
            console.error(e)
            console.log('clearing local game option storage due to parse error')
            localStorage.removeItem(STORE_KEY)
        }
    }
    return {}
}

export const saveLocalGameOptions = (opts: Partial<LocalGameOptions>) => {
    localStorage.setItem(STORE_KEY, JSON.stringify(opts))
}