import {Board, Player} from '../game/GameModel';

export interface StoreState {
    player: Player,
    board: Board,
}