import {LocalGameOptions} from '../../model/board/LocalGameOptions'
import {List, Record} from 'immutable'
import {BOARD_STATE_STARTER, BoardState} from '../../model/board/BoardState'
import {pickNPlayers, PlayerManager} from '../../model/players/Players'
import {Board} from '../../model/board/Board'
import {RandomTerrainArranger} from '../../model/setup/RandomTerrainArranger'
import {SpreadPlayersArranger} from '../../model/setup/SpreadPlayerArranger'
import {Terrain} from '../../model/hex/Terrain'
import {CacheMap} from '../../../common/CacheMap'
import {BasicRobot} from '../../model/players/BasicRobot'

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

const DUMMY_ROBOT = BasicRobot.bySkill(0)

export const getPreviewBoard = (
    options: LocalGameOptions,
    highFidelity: boolean,
): BoardState => {
    const key = makeKey(options)
    const keyNoPlayers = key.set('numRobots', -1).set('capitals', 0)
    const keyBlank = keyNoPlayers.set('mountainPercent', 0)

    // cache low-fidelity of blank hexes (computes set of all tiles)
    const blankBoardState = bsCache.get(keyBlank, () =>
        Object.freeze({
            ...BOARD_STATE_STARTER,
            players: PlayerManager.construct(List()),
            board: Board.constructRectangular(options)
        })
    )

    // while scrubbing board size, always show blank for consistency
    // (even if we have precomputed terrain + players)
    if (!highFidelity)
        return blankBoardState

    // cache with mountains (no players)
    const mountainState = bsCache.get(keyNoPlayers, () =>
        Object.freeze({
            ...blankBoardState,
            board: blankBoardState.board.overlayTiles(  // reuse blank board
                new RandomTerrainArranger(
                    options.mountainPercent / 100
                ).arrange(blankBoardState.board)
            )
        })
    )

    // then, keeping mountains the same, update players
    const result: BoardState = bsCache.get(key, () => {
        const players = pickNPlayers(options.numRobots + 1)
        const boardWithPlayers = mountainState.board.withPlayers(players)
        const boardWithCities = boardWithPlayers.overlayTiles(
            new SpreadPlayersArranger(
                options.capitals ? Terrain.Capital : Terrain.City,
                0,
                // reuse shortest paths
                () => mountainState.board.emptyHexPaths,
                2, 4, 6, 3,
            ).arrange(boardWithPlayers)
        )
        let pm = PlayerManager.construct(players)
        players.forEach((p, i) => {
            if (i !== 0)
                pm = pm.setRobot(p, DUMMY_ROBOT)
        })
        return Object.freeze({
            ...mountainState,
            board: boardWithCities,
            players: pm,
        })
    })
    return result
}