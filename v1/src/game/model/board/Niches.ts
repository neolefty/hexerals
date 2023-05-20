import {List} from "immutable"

import {BoardRules} from "./Board"
import {Hex, hexesToString} from "../hex/Hex"

// find half-hexes at the edges of boards (tops & bottoms) where we can add UI elements such as turn tickers and menu buttons.
export class Niches {
    // half-spaces in the top of the board, left-to-right
    readonly tops: List<Hex>
    // half-spaces in the bottom of the board, left-to-right
    readonly bottoms: List<Hex>

    constructor(
        readonly rules: BoardRules
    ) {
        // hexes just below the top have a half-space above them
        this.tops = List<Hex>(
            rules.constraints.all.filter(
                hex => hex.cartY === rules.edges.top - 1
            ).map(hex => hex.getUp())
        ).sort((a, b) => a.compareTo(b))
        // hexes just above the bottom have a half-space below them
        this.bottoms = List<Hex>(
            rules.constraints.all.filter(
                hex => hex.cartY === rules.edges.bottom + 1
            ).map(hex => hex.getDown())
        ).sort((a, b) => a.compareTo(b))
    }

    toString() {
        return `tops: ${
            hexesToString(this.tops)
        }; bottoms: ${
            hexesToString(this.bottoms)
        }`
    }

    get ll(): Hex { return this.bottoms.first(Hex.NONE) }
    get ul(): Hex { return this.tops.first(Hex.NONE) }
    get ur(): Hex { return this.tops.last(Hex.NONE) }
    get lr(): Hex { return this.bottoms.last(Hex.NONE) }
}