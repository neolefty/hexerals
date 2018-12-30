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
        if (bs.cursor !== Hex.NONE && bs.curPlayer) {
            const delta = KEY_CONTROLS.get(e.key, Hex.NONE)
            if (delta !== Hex.NONE) {
                const move = PlayerMove.construct(bs.curPlayer, bs.cursor, delta)
                this.view.props.onQueueMoves(List([move]))
                // TODO don't move into known mountains but move right through unknown ones
                // TODO differentiate between known & unknown mountains — add question mark to unknown, like generals does
                const newCursor = bs.cursor.plus(delta)
                if (bs.board.canBeOccupied(newCursor))
                    this.view.props.onPlaceCursor(newCursor)
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
            this.view.props.onCancelMoves(bs.curPlayer, 1)
            e.preventDefault()
        }
        if (e.key === 'x' && bs.curPlayer) {
            this.view.props.onCancelMoves(bs.curPlayer, -1)
            e.preventDefault()
        }
    }
}