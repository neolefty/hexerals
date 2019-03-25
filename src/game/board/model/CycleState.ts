import {LocalGameOptions} from '../view/LocalGameOptions';
import {BoardState, boardStateToString} from './BoardState';
import {PlayerFogs} from './Fog';

export enum CycleMode {
    IN_LOCAL_GAME = 'in local game',
    NOT_IN_GAME = 'not in game',
}

export interface CycleState {
    mode: CycleMode;
    localOptions: LocalGameOptions;
    localGame?: LocalGameState;
}

export interface LocalGameState {
    fogs: PlayerFogs
    boardState: BoardState
}

export const cycleStateToString = (s: CycleState): string =>
    ''
    + `mode: ${s.mode}\n`
    + `localOptions: ${JSON.stringify(s.localOptions)}\n`
    + `localGame.boardState: ${
            s.localGame
                ? boardStateToString(s.localGame.boardState)
                : 'undefined'
        }`