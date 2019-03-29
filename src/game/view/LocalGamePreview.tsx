import * as React from 'react'
import {List, Map, Record, Set} from 'immutable'

import {LocalGameOptions} from './LocalGameOptions'
import {CartPair} from '../../common/CartPair'
import {BOARD_STUBS} from './BoardViewBase'
import {DriftColor} from '../../color/DriftColor'
import {pickNPlayers, Player, PlayerManager} from '../model/players/Players'
import {BoardState} from '../model/board/BoardState'
import {Board} from '../model/board/Board'
import {Hex} from '../model/hex/Hex'
import {MovementQueue} from '../model/move/MovementQueue'
import {StatusMessage} from '../../common/StatusMessage'
import {RandomTerrainArranger} from '../model/setup/RandomTerrainArranger'
import {CieColor} from '../../color/CieColor'
import {Terrain} from '../model/hex/Terrain'
import {CacheMap} from '../../common/CacheMap'
import {GamePhase} from '../model/cycle/GamePhase'
import {SpreadPlayersArranger} from '../model/setup/SpreadPlayerArranger'
import {BoardAndStats} from './BoardAndStats'

export interface LocalGamePreviewProps {
    localOptions: LocalGameOptions
    highFidelity: boolean
    displaySize: CartPair
}

const [ MIN_BORING, MAX_BORING ] = [ 10, 30 ]
const randomLightness = () =>
    MIN_BORING + Math.random() * (MAX_BORING - MIN_BORING)

class BoringColor extends DriftColor {
    constructor(lightness?: number) {
        super(new CieColor([0, 0, Math.min(MAX_BORING,
            lightness === undefined ? randomLightness() : lightness
        )]))
    }

    contrast(): BoringColor {
        return new BoringColor(MAX_BORING - this.lightness)
    }


    texture(diff: number = 20): DriftColor {
        return super.texture(diff / 2)
    }
}

let prevGrey = Map<Player, DriftColor>()
let prevGreyPlayers = Set<Player>()
const greyColors = (bs: BoardState): Map<Player, DriftColor> => {
    const intersectPlayers = prevGreyPlayers.sort().intersect(
        List(bs.players.playerIndexes.keys()).sort()
    )
    if (intersectPlayers.size !== bs.players.size) {
        prevGrey = bs.players.playerIndexes.map(
            () => new BoringColor()
        ).set(
            // dark background
            Player.Nobody,
            DriftColor.constructHSL(0, 0, 10)
        )
        prevGreyPlayers = Set<Player>(prevGrey.keys())
    }
    return prevGrey
}

// options that change how the preview looks
type CacheKey = {
    numRobots: number,
    boardWidth: number,
    boardHeight: number,
    mountainPercent: number,
    capitals: number,
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
})
type CacheKeyKey = keyof CacheKey
const CACHE_PROP_NAMES: CacheKeyKey[] = [
    'numRobots', 'boardWidth', 'boardHeight', 'mountainPercent', 'capitals',
]
const makeKey = (opts: LocalGameOptions): Record<CacheKey> => {
    const result: CacheKeyPartial = {}
    CACHE_PROP_NAMES.forEach(k => result[k] = opts[k])
    return CacheKeyRecord(result)
}

const EmptyBoardState = {
    turn: 0,
    cursors: Map<number, Hex>(),
    players: PlayerManager.construct(List()),
    moves: new MovementQueue(),
    messages: List<StatusMessage>(),
    phase: GamePhase.BeforeStart,
}

const bsCache = new CacheMap<{}, BoardState>(2000)
const getBoardState = (
    options: LocalGameOptions,
    highFidelity: boolean,
): BoardState => {
    const key = makeKey(options)
    const keyNoRobots = key.set('numRobots', -1).set('capitals', 0)
    const keyBlank = keyNoRobots.set('mountainPercent', 0)

    // cache low-fidelity of blank hexes (computes set of all tiles)
    const blankState = bsCache.get(keyBlank, () =>
        Object.freeze({
            ...EmptyBoardState,
            board: Board.constructRectangular(
                options.boardWidth, options.boardHeight
            )
        })
    )

    // while scrubbing board size, always show blank for consistency
    // (even if we have precomputed terrain + players)
    if (!highFidelity)
        return blankState

    // cache with mountains (no players)
    const noRobots = bsCache.get(keyNoRobots, () =>
        Object.freeze({
            ...blankState,
            board: blankState.board.overlayTiles(  // reuse blank board
                new RandomTerrainArranger(
                    options.mountainPercent / 100
                ).arrange(blankState.board)
            )
        })
    )

    // then, keeping mountains the same, add players
    return bsCache.get(key, () => {
        const players = pickNPlayers(options.numRobots + 1)
        const board = noRobots.board.overlayTiles(
            new SpreadPlayersArranger(
                options.capitals ? Terrain.Capital : Terrain.City,
                0,
                // reuse shortest paths
                () => noRobots.board.emptyHexPaths,
                2, 4, 6, 3,
            ).arrange(noRobots.board.withPlayers(players))
        )
        return Object.freeze({
            ...noRobots,
            board: board,
            players: PlayerManager.construct(players)
        })
    })
}

export const LocalGamePreview = (props: LocalGamePreviewProps) => {
    const boardState = getBoardState(props.localOptions, props.highFidelity)
    return (
        <BoardAndStats
            {...BOARD_STUBS}
            displaySize={props.displaySize}
            colors={greyColors(boardState)}
            boardState={boardState}
            grabFocus={false}
            statsVisible={props.localOptions.statsVisible !== 0}
        />
    )
}