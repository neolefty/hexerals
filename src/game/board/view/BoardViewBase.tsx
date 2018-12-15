import {BoardState} from '../model/BoardState';
import Dimension from '../../../common/Dimension';
import {List, Map} from 'immutable';
import {Player} from '../../players/Players';
import {DriftColor} from '../../../color/DriftColor';
import {PlayerMove} from '../model/Move';
import {HexCoord} from '../model/HexCoord';
import * as React from 'react';
import {BoardKeyboardController} from './BoardKeyboardController';

export interface BoardViewActions {
    onQueueMoves: (moves: List<PlayerMove>) => void
    onCancelMoves: (player: Player, count: number) => void
    onPlaceCursor: (position: HexCoord) => void
    onEndGame: () => void
}

export interface BoardViewProps extends BoardViewActions {
    boardState: BoardState
    displaySize: Dimension
    colors?: Map<Player, DriftColor>
}

export class BoardViewBase extends React.Component<BoardViewProps> {
    protected readonly keyboardController: BoardKeyboardController

    constructor(props: BoardViewProps) {
        super(props)
        this.keyboardController = new BoardKeyboardController(this)
    }
}