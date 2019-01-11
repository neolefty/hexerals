import {Hex} from './Hex';
import {Player} from './players/Players';

export class HexMove {
    constructor(
        readonly source: Hex,
        readonly delta: Hex,
    ) {}

    get dest(): Hex { return this.source.plus(this.delta) }

    public toString(): string {
        return `move from ${this.source} to ${this.dest}`
    }
}

export class PlayerMove {
    static constructDelta = (
        player: Player, source: Hex, delta: Hex, cursorIndex: number = 0,
    ) => new PlayerMove(
        player, new HexMove(source, delta), cursorIndex,
    )

    static constructDest = (
        player: Player, source: Hex, dest: Hex, cursorIndex: number = 0,
    ) => new PlayerMove(
        player, new HexMove(source, dest.minus(source)), cursorIndex,
    )

    static construct = (
        player: Player, move: HexMove, cursorIndex: number = 0,
    ) => new PlayerMove(
        player, move, cursorIndex,
    )

    private constructor(
        readonly player: Player,
        readonly move: HexMove,
        readonly cursorIndex: number = 0,
    ) {}

    get source(): Hex { return this.move.source }
    get delta(): Hex { return this.move.delta }
    get dest(): Hex { return this.move.dest }

    public toString(): string { return `${this.player} ${this.move}` }

    // ignores cursorIndex
    equals(that: PlayerMove) {
        return this.player === that.player
            && this.source === that.source
            && this.delta === that.delta
    }
}