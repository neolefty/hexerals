import {LocalGameOptions} from '../../../model/board/LocalGameOptions'
import {List, Record} from 'immutable'
import {BOARD_STATE_STARTER, BoardState} from '../../../model/board/BoardState'
import {pickNPlayers, PlayerManager} from '../../../model/players/Players'
import {Board} from '../../../model/board/Board'
import {RandomTerrainArranger} from '../../../model/setup/RandomTerrainArranger'
import {SpreadPlayersArranger} from '../../../model/setup/SpreadPlayerArranger'
import {Terrain} from '../../../model/hex/Terrain'
import {CacheMap} from '../../../../common/CacheMap'

// options that change how the preview looks
type CacheKey = {
    numRobots: number,
    boardWidth: number,
    boardHeight: number,
    mountainPercent: number,
    capitals: number,
    statsVisible: number,
}

type Partial<T> = {
    [P in keyof T]?: T[P]
}

type CacheKeyPartial = Partial<CacheKey>

// that's an abstract way of saying:
// type CacheKeyPartial = {
//     [K in keyof CacheKey]?: CacheKey[K]
// }
const CacheKeyRecord = Record<CacheKey>({
    numRobots: NaN,
    boardWidth: NaN,
    boardHeight: NaN,
    mountainPercent: NaN,
    capitals: NaN,
    statsVisible: NaN,
})

type CacheKeyKey = keyof CacheKey

const CACHE_PROP_NAMES: CacheKeyKey[] = [
    'numRobots', 'boardWidth', 'boardHeight', 'mountainPercent', 'capitals', 'statsVisible',
]

const makeKey = (opts: LocalGameOptions): Record<CacheKey> => {
    const result: CacheKeyPartial = {}
    CACHE_PROP_NAMES.forEach(k => result[k] = opts[k])
    return CacheKeyRecord(result)
}
const bsCache = new CacheMap<{}, BoardState>(2000)

export const getPreviewBoard = (
    options: LocalGameOptions,
    highFidelity: boolean,
): BoardState => {
    const key = makeKey(options)
    const keyNoPlayers = key.set('numRobots', -1).set('capitals', 0)
    const keyBlank = keyNoPlayers.set('mountainPercent', 0)

    // cache low-fidelity of blank hexes (computes set of all tiles)
    const blankState = bsCache.get(keyBlank, () =>
        Object.freeze({
            ...BOARD_STATE_STARTER,
            players: PlayerManager.construct(List()),
            board: Board.constructRectangular(options)
        })
    )
    console.log(`blank has ${blankState.players.size} players`)

    // while scrubbing board size, always show blank for consistency
    // (even if we have precomputed terrain + players)
    if (!highFidelity)
        return blankState

    // cache with mountains (no players)
    const boardNoPlayers = bsCache.get(keyNoPlayers, () =>
        Object.freeze({
            ...blankState,
            board: blankState.board.overlayTiles(  // reuse blank board
                new RandomTerrainArranger(
                    options.mountainPercent / 100
                ).arrange(blankState.board)
            )
        })
    )

    // then, keeping mountains the same, update players
    const result: BoardState = bsCache.get(key, () => {
        const players = pickNPlayers(options.numRobots + 1)
        const board = boardNoPlayers.board.overlayTiles(
            new SpreadPlayersArranger(
                options.capitals ? Terrain.Capital : Terrain.City,
                0,
                // reuse shortest paths
                () => boardNoPlayers.board.emptyHexPaths,
                2, 4, 6, 3,
            ).arrange(boardNoPlayers.board.withPlayers(players))
        )
        return Object.freeze({
            ...boardNoPlayers,
            board: board,
            players: PlayerManager.construct(players)
        })
    })
    console.log(`populated has ${result.players.size} players`)
    return result
}