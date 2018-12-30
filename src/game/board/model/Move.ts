import {Hex} from './Hex';
import {Player} from './players/Players';

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
    static constructDelta = (player: Player, source: Hex, delta: Hex) =>
        new PlayerMove(player, new HexMove(source, delta))

    static constructDest = (player: Player, source: Hex, dest: Hex) =>
        new PlayerMove(
            player,
            new HexMove(source, dest.minus(source))
        )

    static construct = (player: Player, move: HexMove): PlayerMove =>
        new PlayerMove(player, move)

    private constructor(
        readonly player: Player,
        readonly  move: HexMove,
    ) {}

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