import * as React from 'react';
import {Board} from './Board';
import {BoardContainer} from './BoardContainer';
import {HexCoord} from './Hex';

interface GameViewProps {
    board?: Board;
    cursor: HexCoord; // could move cursor into BoardView state

    onNewGame: () => void;
}

export const GameView = (props: GameViewProps) => {
    if (props.board) {
        <BoardContainer>
        </BoardContainer>
    }
}