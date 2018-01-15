import { HexCoord } from '../game/Hex';
import { Board } from '../game/Board';

export interface StoreState {
    board: Board;
    cursor: HexCoord;
}