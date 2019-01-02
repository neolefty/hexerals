import * as assert from 'assert';
import {List, Map, Set} from 'immutable';

import {Tile} from './Tile';
import {Board, TileFilter} from './Board';
import {StatusMessage} from '../../../common/StatusMessage';
import {Hex} from './Hex';
import {connected} from './HexGraph';
import {Arranger} from './Arranger';
import {Terrain} from './Terrain';

// replace empty terrain randomly and without blocking
export class RandomTerrainArranger extends Arranger {
    constructor(
        // what fraction of empty terrain should be replaced?
        readonly fractionOfEmpty: number,
        // terrain to substitute randomly for Empty
        readonly terrain: Terrain = Terrain.Mountain,
        // is it okay to bisect the map using this terrain?
        readonly allowBisection: boolean = false,
        // what explicitTiles should be considered when avoiding bisection?
        readonly bisectionFilter: TileFilter = tile => tile.canBeOccupied,
    ) {
        super()
        assert(fractionOfEmpty <= 1 && fractionOfEmpty >= 0)
    }

    arrange(
        board: Board,
        status: StatusMessage[] | undefined = undefined,
    ): Map<Hex, Tile> {
        // remaining explicitTiles we don't want to bisect -- may contain some that
        // are not candidates for replacement because it would bisect the map
        let notToBisect: Set<Hex> = board.filterTiles(this.bisectionFilter)
        // explicitTiles we might replace with terrain
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
                const hex = remainingCandidates.get(r)
                // can't try this one again, whether it bisects or not
                remainingCandidates = remainingCandidates.delete(r)
                // would it bisect the remaining empty explicitTiles?
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
                assert.strictEqual(
                    remainingCandidates.size,
                    beforeEmpty - numReplacements - bisectionsAvoided,
                )
        })
    }
}