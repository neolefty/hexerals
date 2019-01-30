import * as React from 'react';
import {List, Map} from 'immutable'

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
}

const greyColors = (bs: BoardState): Map<Player, DriftColor> => {
    return bs.players.playerIndexes.map(
        () => new BoringColor()
    ).set(
        // dark background
        Player.Nobody,
        DriftColor.constructHSL(0, 0, 10)
    )
}

const createBoardState = (options: LocalGameOptions): BoardState => {
    const players = pickNPlayers(options.numRobots + 1)
    const board = Board.constructRectangular(
        options.boardWidth, options.boardHeight, players, [
            new RandomTerrainArranger(
                options.mountainPercent / 100),
            // new RandomPlayerArranger(
            //     0, options.capitals ? Terrain.Capital : Terrain.City),
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
    }
}

export const LocalGamePreview = (props: LocalGamePreviewProps) => {
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