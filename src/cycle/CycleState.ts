import {LocalGameOptions} from './LocalGameOptions';
import {BoardState} from '../game/BoardState';

export enum CycleMode {
    IN_LOCAL_GAME = 'in local game',
    NOT_IN_GAME = 'not in game',
}

export interface CycleState {
    mode: CycleMode;
    localOptions: LocalGameOptions;
    localGame?: BoardState;
}