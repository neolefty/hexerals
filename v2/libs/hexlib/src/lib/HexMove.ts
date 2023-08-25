import { Hex } from "./Hex"

export class HexMove {
    static readonly NO_MOVE = new HexMove(Hex.NONE, Hex.ORIGIN)

    static constructDest(source: Hex, dest: Hex) {
        return new HexMove(source, dest.minus(source))
    }

    constructor(readonly source: Hex, readonly delta: Hex) {}

    get dest(): Hex {
        return this.source.plus(this.delta)
    }

    public toString(): string {
        return `move from ${this.source} to ${this.dest}`
    }

    // tslint:disable-next-line:no-any
    public equals(that: any) {
        return that && this.source === that.source && this.delta === that.delta
    }
}
