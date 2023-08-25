// arranges players on a board
import { TileArranger } from "./TileArranger"
import { Terrain } from "./Terrain"
import { StatusMessage } from "./StatusMessage"
import { Board } from "./Board"
import { Hex } from "./Hex"
import { Tile } from "./Tile"
import { HexMap } from "./HexMap"

export class RandomPlayerArranger implements TileArranger {
    constructor(
        readonly startingPop: number = 0,
        readonly startingTerrain: Terrain = "City"
    ) {}

    // return a map of starting tiles
    public arrange(board: Board, status?: StatusMessage[]): HexMap<Tile> {
        let emptyHexes: Hex[] = board
            .filterTiles((tile) => tile.terrain === Terrain.Empty)
            .toArray()
        let starts = Map<Hex, Tile>()
        board.players.forEach((player: Player) => {
            if (emptyHexes.length > 0) {
                const i = Math.floor(Math.random() * emptyHexes.length)
                // shorten emptyHexes by 1
                const hex = emptyHexes.splice(i, 1)[0]
                starts = starts.set(
                    hex,
                    new Tile(player, this.startingPop, this.startingTerrain)
                )
            } else {
                if (status)
                    status.push(
                        new StatusMessage(
                            TAG_MAP_TOO_SMALL,
                            `Could not place player ${player}`,
                            `map size ${board.hexesAll.size} / players ${board.players.size}`
                        )
                    )
            }
        })
        return starts
    }
}
