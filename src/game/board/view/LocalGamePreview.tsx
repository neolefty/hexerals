import * as React from 'react'
import {List, Map, Record, Set} from 'immutable'

import {LocalGameOptions} from './LocalGameOptions'
import {HexBoardView} from './HexBoardView'
import {CartPair} from '../../../common/CartPair'
import {BOARD_STUBS} from './BoardViewBase'
import {DriftColor} from '../../../color/DriftColor'
import {pickNPlayers, Player, PlayerManager} from '../model/players/Players'
import {BoardState} from '../model/BoardState'
import {Board} from '../model/Board'
import {Hex} from '../model/Hex'
import {MovementQueue} from '../model/MovementQueue'
import {StatusMessage} from '../../../common/StatusMessage'
import {RandomTerrainArranger} from '../model/RandomTerrainArranger'
import {CieColor} from '../../../color/CieColor'
import {RandomPlayerArranger} from '../model/PlayerArranger'
import {Terrain} from '../model/Terrain'
import {CacheMap} from '../../../common/CacheMap'
import {GamePhase} from '../model/GamePhase'

export interface LocalGamePreviewProps {
    localOptions: LocalGameOptions
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
}
const CacheKeyRecord = Record<CacheKey>({
    numRobots: NaN,
    boardWidth: NaN,
    boardHeight: NaN,
    mountainPercent: NaN,
})
const CACHE_PROP_NAMES = [
    'numRobots', 'boardWidth', 'boardHeight', 'mountainPercent', 'capitals',
]
const makeKey = (opts: LocalGameOptions): any => {
    const result = {}
    CACHE_PROP_NAMES.forEach(k => result[k] = opts[k])
    return CacheKeyRecord(result)
}

const bsCache = new CacheMap<{}, BoardState>(2000)
const getBoardState = (options: LocalGameOptions): BoardState =>
    bsCache.get(makeKey(options), () => {
        // console.log(`making ${JSON.stringify(makeKey(options))} (${bsCache.size})`)
        const players = pickNPlayers(options.numRobots + 1)
        const board = Board.constructRectangular(
            options.boardWidth, options.boardHeight, players, [
                new RandomTerrainArranger(
                    options.mountainPercent / 100),
                new RandomPlayerArranger(
                    0, options.capitals ? Terrain.Capital : Terrain.City),
                // TODO cache mountains & path maps for a given size so we can use SpreadPlayersArranger
                // new SpreadPlayersArranger(
                //     options.capitals ? Terrain.Capital : Terrain.City),
            ])

        return {
            board: board,
            turn: 0,
            cursors: Map<number, Hex>(),
            players: PlayerManager.construct(players),
            moves: new MovementQueue(),
            messages: List<StatusMessage>(),
            phase: GamePhase.BeforeStart,
        }
    })

export const LocalGamePreview = (props: LocalGamePreviewProps) => {
    const boardState = getBoardState(props.localOptions)
    return (
        <HexBoardView
            {...BOARD_STUBS}
            displaySize={props.displaySize}
            colors={greyColors(boardState)}
            boardState={boardState}
            grabFocus={false}
        />
    )
}