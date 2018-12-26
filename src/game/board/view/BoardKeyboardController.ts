import {List, Map} from 'immutable';
import * as React from 'react';

import {HexCoord} from '../model/HexCoord';
import {PlayerMove} from '../model/Move';
import {BoardViewBase} from './BoardViewBase';
import {Terrain} from '../model/Spot';

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
                const move = PlayerMove.construct(bs.curPlayer, bs.cursor, delta)
                this.view.props.onQueueMoves(List([move]))
                // TODO don't move into known mountains but move right through unknown ones
                // TODO differentiate between known & unknown mountains — add question mark to unknown, like generals does
                const newCursor = bs.cursor.plus(delta)
                if (
                    bs.board.inBounds(newCursor)
                    && bs.board.getSpot(newCursor).terrain !== Terrain.Mountain
                )
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