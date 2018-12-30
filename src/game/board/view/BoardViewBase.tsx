import {BoardState} from '../model/BoardState';
import CartPair from '../../../common/CartPair';
import {List, Map} from 'immutable';
import {Player} from '../../players/Players';
import {DriftColor} from '../../../color/DriftColor';
import {PlayerMove} from '../model/Move';
import {Hex} from '../model/Hex';
import * as React from 'react';
import {BoardKeyboardController} from './BoardKeyboardController';

export interface BoardViewActions {
    onQueueMoves: (moves: List<PlayerMove>) => void
    onCancelMoves: (player: Player, count: number) => void
    onPlaceCursor: (position: Hex) => void
    onEndGame: () => void
}

export interface BoardViewProps extends BoardViewActions {
    boardState: BoardState
    displaySize: CartPair
    colors?: Map<Player, DriftColor>
}

export class BoardViewBase extends React.PureComponent<BoardViewProps> {
    protected readonly keyboardController: BoardKeyboardController

    constructor(props: BoardViewProps) {
        super(props)
        this.keyboardController = new BoardKeyboardController(this)
    }
}