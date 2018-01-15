import {Board} from './Board';
import {HexCoord} from './Hex';

export interface StoreState {
    board: Board;
    cursor: HexCoord;
}