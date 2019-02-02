import * as React from 'react';
import {List, Map, Set} from 'immutable'

import {LocalGameOptions} from './LocalGameOptions'
import {HexBoardView} from './HexBoardView'
import {CartPair} from '../../../common/CartPair'
import {BOARD_STUBS} from './BoardViewBase'
import {DriftColor} from '../../../color/DriftColor'
import {pickNPlayers, Player, PlayerManager} from '../model/players/Players'
import {BoardState} from '../model/BoardState';
import {Board} from '../model/Board';
import {Hex} from '../model/Hex';
import {MovementQueue} from '../model/MovementQueue';
import {StatusMessage} from '../../../common/StatusMessage';
import {RandomTerrainArranger} from '../model/RandomTerrainArranger';
import {CieColor} from '../../../color/CieColor';
import {RandomPlayerArranger} from '../model/PlayerArranger';
import {Terrain} from '../model/Terrain';

export interface LocalGamePreviewProps {
    localOptions: LocalGameOptions
    displaySize: CartPair
}

// ignore changes in options not in this list
// except for displaySize
/*
const OPTIONS_TRIGGER_UPDATE = [
    'numRobots', 'boardWidth', 'boardHeight', 'mountainPercent', 'capitals',
]
*/

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
        return super.texture(diff / 2);
    }
}

let prevGrey = Map<Player, DriftColor>()
let prevGreyPlayers = Set<Player>()
const greyColors = (bs: BoardState): Map<Player, DriftColor> => {
    const intersectPlayers = prevGreyPlayers.intersect(
        bs.players.playerIndexes.keys()
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

let prevBoardState: BoardState | undefined = undefined

const boardMatches = (
    bs: BoardState, opts: LocalGameOptions
): boolean => {
    const hq = opts.capitals === 1 ? Terrain.Capital : Terrain.City
    return (
        bs.players.size === opts.numRobots + 1
        && bs.board.edges.width === opts.boardWidth
        && bs.board.edges.height === opts.boardHeight
        && bs.board.explicitTiles.filter(
            tile => tile.terrain === hq
        ).size === bs.players.size
        // TODO deserves a unit test or to be moved to RandomArranger ...
        && bs.board.explicitTiles.filter(
            tile => tile.terrain === Terrain.Mountain
        ).size === Math.floor(
            bs.board.hexesAll.size * opts.mountainPercent / 100
        )
    )
}

// TODO cache based on options? Then can remove shouldCompUpdate()
const createBoardState = (options: LocalGameOptions): BoardState => {
    if (!prevBoardState || !boardMatches(prevBoardState, options)) {
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

        prevBoardState = {
            board: board,
            turn: 0,
            cursors: Map<number, Hex>(),
            players: PlayerManager.construct(players),
            moves: new MovementQueue(),
            messages: List<StatusMessage>(),
        }
    }

    return prevBoardState
}

export const LocalGamePreview = (props: LocalGamePreviewProps) => {
    // shouldComponentUpdate(
    //     nextProps: Readonly<LocalGamePreviewProps>,
    //     nextState: Readonly<{}>,
    //     nextContext: any
    // ): boolean {
    //     for (let i = 0; i < OPTIONS_TRIGGER_UPDATE.length; ++i) {
    //         const option = OPTIONS_TRIGGER_UPDATE[i]
    //         if (nextProps.localOptions[option] !== this.props.localOptions[option])
    //             return true
    //     }
    //     if (!nextProps.displaySize.equals(this.props.displaySize))
    //         return true
    //     return false
    // }

    const boardState = createBoardState(props.localOptions)
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