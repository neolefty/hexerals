import {List, Map} from 'immutable'
import {DriftColor} from '../../../color/DriftColor'
import {BoardState} from '../../model/board/BoardState'
import {Hex} from '../../model/hex/Hex'
import {PlayerMove} from '../../model/move/Move'
import {Player} from '../../model/players/Players'

export interface BoardViewProps extends BoardViewActions {
    boardState: BoardState
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