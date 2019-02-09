import {Tile} from './Tile';
import {Hex} from './Hex';

export class Capture {
    constructor(
        readonly hex: Hex,
        readonly before: Tile,
        readonly after: Tile
    ) {}

    toString() {
        return `@${this.hex.toString()} ${this.before.terrain} — ${
            this.after.owner} captured ${
            this.before.owner}; new pop is ${this.after.pop}`
    }

    equals(that: any) {
        return that !== undefined
            && that.hex === this.hex
            && this.before.equals(that.before)
            && this.after.equals(that.after)
    }
}