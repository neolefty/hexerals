import {List, Map, Set} from 'immutable';
import {devAssert} from "../../../common/Environment"

import {Tile} from '../hex/Tile';
import {Board, TileFilter} from '../board/Board';
import {Hex} from '../hex/Hex';
import {connected} from '../hex/HexGraph';
import {TileArranger} from './TileArranger';
import {Terrain} from '../hex/Terrain';
import {StatusMessage} from '../../../common/StatusMessage';

// replace empty terrain randomly and without blocking
export class RandomTerrainArranger extends TileArranger {
    constructor(
        // what fraction of empty terrain should be replaced?
        readonly fractionOfEmpty: number,
        // terrain to substitute randomly for Empty
        readonly terrain: Terrain = Terrain.Mountain,
        // is it okay to bisect the map using this terrain?
        readonly allowBisection: boolean = false,
        // what tiles should be considered when avoiding bisection?
        readonly bisectionFilter: TileFilter = tile => tile.canBeOccupied,
    ) {
        super()
        devAssert(fractionOfEmpty >= 0)
        devAssert(fractionOfEmpty <= 1)
    }

    arrange(
        board: Board,
        status: StatusMessage[] | undefined = undefined,
    ): Map<Hex, Tile> {
        // remaining tiles we don't want to bisect -- may contain some that
        // are not candidates for replacement because it would bisect the map
        let notToBisect: Set<Hex> = board.filterTiles(this.bisectionFilter)
        // tiles we might replace with terrain
        let remainingCandidates: List<Hex> = List(board.filterTiles(
            tile => tile.isBlank()
        ))
        let ranOutOfSpace = false
        let bisectionsAvoided = 0

        const beforeEmpty = remainingCandidates.size
        const numReplacements = Math.floor(this.fractionOfEmpty * beforeEmpty)

        return Map<Hex, Tile>().withMutations(result => {
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
                        status.push(new StatusMessage(
                            'map too small',
                            `only placed ${result.size} of ${numReplacements} ${this.terrain} tiles`,
                        ))
                    ranOutOfSpace = true
                    break
                }
            }
            if (!ranOutOfSpace)
                devAssert(remainingCandidates.size === beforeEmpty - numReplacements - bisectionsAvoided)
        })
    }
}
