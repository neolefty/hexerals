export interface LocalGameOptions {
    // All numbers because our reducer assumes it.
    // If we need a non-number, the reducer should be easy to modify.
    numRobots: number
    tickMillis: number
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
    randomStart: number  // players start in random locations?

    // allow indexing
    // [key: LGOKey]: number
}