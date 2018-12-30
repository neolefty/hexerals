import {Hex} from './Hex';
import {Player} from '../../players/Players';

export class HexMove {
    constructor(
        readonly source: Hex,
        readonly delta: Hex,
    ) {
    }

    get dest(): Hex {
        return this.source.plus(this.delta)
    }

    public toString(): string {
        return `move from ${this.source} to ${this.dest}`
    }
}

export class PlayerMove {
    static construct(player: Player, source: Hex, delta: Hex): PlayerMove {
        return new PlayerMove(player, new HexMove(source, delta))
    }

    constructor(
        readonly player: Player,
        readonly  move: HexMove,
    ) {
    }

    get source(): Hex {
        return this.move.source
    }

    get delta(): Hex {
        return this.move.delta
    }

    get dest(): Hex {
        return this.move.dest
    }

    public toString(): string {
        return `${this.player} ${this.move}`
    }
}