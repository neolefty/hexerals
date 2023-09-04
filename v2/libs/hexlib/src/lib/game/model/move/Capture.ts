import { Tile } from "../hex/Tile"
import { Hex } from "../hex/Hex"

export class Capture {
    constructor(
        readonly hex: Hex,
        readonly before: Tile,
        readonly after: Tile
    ) {}

    toString() {
        return `@${this.hex.toString()} ${this.before.terrain} — ${
            this.after.owner
        } captured ${this.before.owner}; new pop is ${this.after.pop}`
    }

    equals(that: unknown) {
        return (
            that !== undefined &&
            (that as Capture).hex === this.hex &&
            this.before.equals((that as Capture).before) &&
            this.after.equals((that as Capture).after)
        )
    }
}
