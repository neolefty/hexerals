// place up to 4 players in lower left, upper right, upper left, and lower right
import { TAG_MAP_TOO_SMALL, TileArranger } from "./TileArranger"
import { Terrain } from "./Terrain"
import { Board } from "./Board"
import { StatusMessage } from "./StatusMessage"
import { HexTile } from "./HexTile"
import { devAssert } from "./Environment"
import { Tile } from "./Tile"
import { HexMap } from "./HexMap"

export class CornersPlayerArranger implements TileArranger {
    constructor(
        readonly startingPop: number = 0,
        readonly terrain: Terrain = "City"
    ) {}

    public arrange(board: Board, status?: StatusMessage[]): HexTile[] {
        devAssert(board.players.length <= 4)
        let starts: HexMap<Tile> = new HexMap<Tile>()
        const corners = [
            (b: Board) => b.edges.lowerLeft,
            (b: Board) => b.edges.upperRight,
            (b: Board) => b.edges.upperLeft,
            (b: Board) => b.edges.lowerRight,
        ]
        board.players.forEach((player, i) => {
            const hex = corners[i](board)
            const prevOwner = starts.get(hex, Tile.EMPTY).owner
            if (prevOwner !== Player.Nobody) {
                if (status)
                    status.push({
                        tag: TAG_MAP_TOO_SMALL,
                        msg: `Could not place player ${player} in corner #${i}.`,
                        debug: `Hex at ${hex.toString()} already occupied by ${prevOwner}`,
                    })
            } else
                starts = starts.set(
                    hex,
                    new Tile(player, this.startingPop, this.terrain)
                )
        })
        return starts
    }

    toString = (): string =>
        `corners arranger — capital: ${this.terrain}; pop: ${this.startingPop}`
}

// Spread out players — maximize each player's distance to their nearest neighbor,
// and minimize the difference between those nearest neighbors.
// This may not really be fair because some players will have more nearby neighbors than others.
// Maybe better to minimize difference in total distance to neighbors?
