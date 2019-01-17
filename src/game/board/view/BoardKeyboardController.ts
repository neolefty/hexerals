import {List, Map} from 'immutable';
import * as React from 'react';

import {Hex} from '../model/Hex';
import {PlayerMove} from '../model/Move';
import {BoardViewBase} from './BoardViewBase';

const KEY_CONTROLS: Map<string, Hex> = Map({
    'ArrowLeft': Hex.LEFT_DOWN,
    'Home': Hex.LEFT_UP,
    'ArrowRight': Hex.RIGHT_DOWN,
    'PageUp': Hex.RIGHT_UP,
    'ArrowUp': Hex.UP,
    'ArrowDown': Hex.DOWN,
    'q': Hex.LEFT_UP,
    'a': Hex.LEFT_DOWN,
    'w': Hex.UP,
    's': Hex.DOWN,
    'e': Hex.RIGHT_UP,
    'd': Hex.RIGHT_DOWN,
})

export class BoardKeyboardController {
    constructor(private view: BoardViewBase) {
        this.onKeyDown = this.onKeyDown.bind(this)
    }

    onKeyDown(e: React.KeyboardEvent<HTMLDivElement>): void {
        const bs = this.view.props.boardState
        if (bs.cursors.get(0) !== Hex.NONE && bs.curPlayer) {
            const delta = KEY_CONTROLS.get(e.key, Hex.NONE)
            if (delta !== Hex.NONE) {
                const move = PlayerMove.constructDelta(bs.curPlayer, bs.cursors.get(0), delta)
                if (bs.board.canBeOccupied(move.dest))
                    this.view.props.onQueueMoves(List([move]))
                const newCursor = bs.cursors.get(0).plus(delta)
                this.view.props.onPlaceCursor(0, newCursor, true)
                e.preventDefault()
                return
            }
        }

        if (e.key === 'Escape') {
            this.view.props.onEndGame()
            e.preventDefault()
            return
        }

        if (e.key === 'z' && bs.curPlayer) {
            this.view.props.onCancelMoves(bs.curPlayer, -1, 1)
            e.preventDefault()
        }
        if (e.key === 'x' && bs.curPlayer) {
            this.view.props.onCancelMoves(bs.curPlayer, -1, -1)
            e.preventDefault()
        }
    }
}