import { Hex } from "./Hex"
import { HexMove } from "./HexMove"
import { Player } from "./Player"

export class PlayerMove {
    static constructDelta = (
        player: Player,
        source: Hex,
        delta: Hex,
        cursorIndex = 0
    ) => new PlayerMove(player, new HexMove(source, delta), cursorIndex)

    static constructDest = (
        player: Player,
        source: Hex,
        dest: Hex,
        cursorIndex = 0
    ) =>
        new PlayerMove(
            player,
            new HexMove(source, dest.minus(source)),
            cursorIndex
        )

    static construct = (player: Player, move: HexMove, cursorIndex = 0) =>
        new PlayerMove(player, move, cursorIndex)

    private constructor(
        readonly player: Player,
        readonly move: HexMove,
        readonly cursorIndex = 0
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

    // tslint:disable-next-line:no-any
    public equals(that: any) {
        // ignores cursorIndex
        return (
            that && this.player === that.player && this.move.equals(that.move)
        )
    }
}
