import {BoardState} from '../model/BoardState'
import {CartPair} from '../../../common/CartPair'
import {List, Map} from 'immutable'
import {Player} from '../model/players/Players'
import {DriftColor} from '../../../color/DriftColor'
import {PlayerMove} from '../model/Move'
import {Hex} from '../model/Hex'
import * as React from 'react'
import {BoardKeyboardController} from './BoardKeyboardController'

export interface BoardViewProps extends BoardViewActions {
    boardState: BoardState
    displaySize: CartPair
    colors?: Map<Player, DriftColor>
    grabFocus?: boolean
}

export interface BoardViewActions {
    onQueueMoves: (moves: List<PlayerMove>) => void
    onDrag: (
        player: Player, cursorIndex: number, source: Hex, dest: Hex,
    ) => void
    onCancelMoves: (
        player: Player, cursorIndex: number, count: number,
    ) => void
    onPlaceCursor: (
        index: number, position: Hex, clearOthers: boolean,
    ) => void
    onEndGame: () => void
    onRestartGame: () => void
    onResetColors: (n: number) => void
}

export class BoardViewBase extends React.PureComponent<BoardViewProps> {
    protected readonly keyboardController: BoardKeyboardController

    constructor(props: BoardViewProps) {
        super(props)
        this.keyboardController = new BoardKeyboardController(this)
    }
}

export const BOARD_STUBS: BoardViewActions = ({
    /* tslint:disable */
    onQueueMoves: () => {},
    onDrag: () => {},
    onCancelMoves: () => {},
    onPlaceCursor: () => {},
    onEndGame: () => {},
    onRestartGame: () => {},
    onResetColors: () => {},
    /* tslint:enable */
})