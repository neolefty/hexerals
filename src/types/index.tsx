import { HexCoord } from '../game/Hex';
import { HexBoard } from '../game/HexBoard';

export interface StoreState {
    board: HexBoard;
    cursor: HexCoord;
}