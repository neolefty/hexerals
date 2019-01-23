import {Hex} from './Hex';
import {Player} from './players/Players';
import {hash, ValueObject} from 'immutable';

export class HexMove implements ValueObject {
    static constructDest(source: Hex, dest: Hex) {
        return new HexMove(source, dest.minus(source))
    }

    constructor(
        readonly source: Hex,
        readonly delta: Hex,
    ) {}

    get dest(): Hex { return this.source.plus(this.delta) }

    public toString(): string {
        return `move from ${this.source} to ${this.dest}`
    }

    // tslint:disable-next-line:no-any
    public equals(that: any) {
        return that
            && this.source === that.source
            && this.delta === that.delta
    }

    hashCode(): number {
        return hash(this.source) + hash(this.delta)
    }
}

export class PlayerMove implements ValueObject {
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

    // tslint:disable-next-line:no-any
    public equals(that: any) {  // ignores cursorIndex
        return that
            && this.player === that.player
            && this.move.equals(that.move)
    }

    hashCode(): number {  // ignores cursorIndex
        return hash(this.player) + this.move.hashCode()
    }
}