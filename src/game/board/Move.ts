import {HexCoord} from './HexCoord';
import {Player} from '../players/Players';

export class HexMove {
    constructor(
        readonly source: HexCoord,
        readonly delta: HexCoord,
    ) {
    }

    get dest(): HexCoord {
        return this.source.plus(this.delta)
    }

    public toString(): string {
        return `move from ${this.source} to ${this.dest}`
    }
}

export class PlayerMove {
    static construct(player: Player, source: HexCoord, delta: HexCoord): PlayerMove {
        return new PlayerMove(player, new HexMove(source, delta))
    }

    constructor(
        readonly player: Player,
        readonly  move: HexMove,
    ) {
    }

    get source(): HexCoord {
        return this.move.source
    }

    get delta(): HexCoord {
        return this.move.delta
    }

    get dest(): HexCoord {
        return this.move.dest
    }

    public toString(): string {
        return `${this.player} ${this.move}`
    }
}