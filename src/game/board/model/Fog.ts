import {Player} from '../../players/Players';
import {BoardState} from './BoardState';

export class PlayerFog {
    private prevGlobal?: BoardState
    private prevFog?: BoardState

    constructor(readonly player: Player) {
    }

    fog(global: BoardState): BoardState {
        if (this.prevFog && global === this.prevGlobal)
            return this.prevFog

        throw 'nyi'
    }
}