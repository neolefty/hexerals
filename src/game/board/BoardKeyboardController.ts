import {List, Map} from 'immutable';
import * as React from 'react';

import {HexCoord} from './HexCoord';
import {PlayerMove} from './Move';
import {BoardViewBase} from './hexview/BoardView';

const KEY_CONTROLS: Map<string, HexCoord> = Map({
    'ArrowLeft': HexCoord.LEFT_DOWN,
    'Home': HexCoord.LEFT_UP,
    'ArrowRight': HexCoord.RIGHT_DOWN,
    'PageUp': HexCoord.RIGHT_UP,
    'ArrowUp': HexCoord.UP,
    'ArrowDown': HexCoord.DOWN,
    'q': HexCoord.LEFT_UP,
    'a': HexCoord.LEFT_DOWN,
    'w': HexCoord.UP,
    's': HexCoord.DOWN,
    'e': HexCoord.RIGHT_UP,
    'd': HexCoord.RIGHT_DOWN,
})

export class BoardKeyboardController {
    constructor(private view: BoardViewBase) {
        this.onKeyDown = this.onKeyDown.bind(this)
    }

    onKeyDown(e: React.KeyboardEvent<HTMLDivElement>): void {
        const bs = this.view.props.boardState
        if (bs.cursor !== HexCoord.NONE && bs.curPlayer) {
            const delta = KEY_CONTROLS.get(e.key, HexCoord.NONE)
            if (delta !== HexCoord.NONE) {
                this.view.props.onQueueMoves(
                    List([
                        PlayerMove.construct(bs.curPlayer, bs.cursor, delta)
                    ])
                )
                this.view.props.onPlaceCursor(bs.cursor.plus(delta))
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