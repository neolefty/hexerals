import { TileArranger } from "./TileArranger"
import { StatusMessage } from "./StatusMessage"
import { Terrain } from "./Terrain"
import { devAssert } from "./Environment"
import { Board } from "./Board"
import { Hex } from "./Hex"
import { HexMap } from "./HexMap"
import { Tile, TileFilter } from "./Tile"

// replace empty terrain randomly and without blocking
export class RandomTerrainArranger implements TileArranger {
    constructor(
        // what fraction of empty terrain should be replaced?
        readonly fractionOfEmpty: number,
        // terrain to substitute randomly for Empty
        readonly terrain: Terrain = "Mountain",
        // is it okay to bisect the map using this terrain?
        readonly allowBisection: boolean = false,
        // what tiles should be considered when avoiding bisection?
        readonly bisectionFilter: TileFilter = (tile) => tile.canBeOccupied
    ) {
        devAssert(fractionOfEmpty >= 0)
        devAssert(fractionOfEmpty <= 1)
    }

    arrange(board: Board, status?: ReadonlyArray<StatusMessage>): HexMap<Tile> {
        // remaining tiles we don't want to bisect -- may contain some that
        // are not candidates for replacement because it would bisect the map
        let notToBisect: ReadonlySet<Hex> = board.filterTiles(
            this.bisectionFilter
        )
        // tiles we might replace with terrain
        let remainingCandidates: ReadonlyArray<Hex> = List(
            board.filterTiles((tile) => tile.isBlank())
        )
        let ranOutOfSpace = false
        let bisectionsAvoided = 0

        const beforeEmpty = remainingCandidates.size
        const numReplacements = Math.floor(this.fractionOfEmpty * beforeEmpty)

        return Map<Hex, Tile>().withMutations((result) => {
            while (result.size < numReplacements) {
                const r = Math.floor(Math.random() * remainingCandidates.size)
                // pick a random empty to replace with a mountain
                const hex = remainingCandidates.get(r) as Hex
                // can't try this one again, whether it bisects or not
                remainingCandidates = remainingCandidates.delete(r)
                // would it bisect the remaining empty tiles?
                const remainingWithoutThisOne = notToBisect.remove(hex)
                if (this.allowBisection || connected(remainingWithoutThisOne)) {
                    result.set(hex, board.getTile(hex).setTerrain(this.terrain))
                    notToBisect = remainingWithoutThisOne
                } else {
                    bisectionsAvoided += 1
                }
                if (remainingCandidates.size === 0) {
                    if (status)
                        status.push(
                            new StatusMessage(
                                "map too small",
                                `only placed ${result.size} of ${numReplacements} ${this.terrain} tiles`
                            )
                        )
                    ranOutOfSpace = true
                    break
                }
            }
            if (!ranOutOfSpace)
                devAssert(
                    remainingCandidates.size ===
                        beforeEmpty - numReplacements - bisectionsAvoided
                )
        })
    }
}
