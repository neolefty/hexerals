import { Board } from '../game/GameModel';

export interface StoreState {
    board: Board;
    cursor: number;
}