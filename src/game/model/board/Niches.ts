import {List} from "immutable"

import {Board} from "./Board"
import {Hex, hexesToString} from "../hex/Hex"

// find half-hexes at the edges of boards (tops & bottoms) where we can add UI elements such as turn tickers and menu buttons.
export class Niches {
    // half-spaces in the top of the board, left-to-right
    readonly tops: List<Hex>
    // half-spaces in the bottom of the board, left-to-right
    readonly bottoms: List<Hex>

    constructor(
        readonly board: Board
    ) {
        // hexes just below the top have a half-space above them
        this.tops = List<Hex>(
            board.hexesAll.filter(
                hex => hex.cartY === board.edges.top - 1
            ).map(hex => hex.getUp())
        ).sort()
        // hexes just above the bottom have a half-space below them
        this.bottoms = List<Hex>(
            board.hexesAll.filter(
                hex => hex.cartY === board.edges.bottom + 1
            ).map(hex => hex.getDown())
        ).sort()
    }

    toString() {
        return `tops: ${
            hexesToString(this.tops)
        }; bottoms: ${
            hexesToString(this.bottoms)
        }`
    }
}