export interface HexBoard {
    positions: ReadonlyArray<HexCoord>
}

export class HexCoord {
    constructor(readonly x: number, readonly y: number) {}
    get z() {
        return -this.x - this.y
    }
}
