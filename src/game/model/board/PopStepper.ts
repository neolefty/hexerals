import {Board} from './Board';
import {Terrain} from '../hex/Terrain';
import {LocalGameOptions} from './LocalGameOptions'

export class PopStepper {
    constructor(
        readonly opts: LocalGameOptions,
    ) {}

    // called before incrementing turn — anticipate next turn
    step(orig: Board, turn: number): Board {
        let result = orig.explicitTiles
        // TODO consider using a single loop
        // TODO for rolling increments, consider bucketing
        if ((turn + 1) % this.opts.cityTicks === 0)
            result = result.withMutations(mut =>
                result.forEach((tile, hex) => {
                    if (tile.growsFast && tile.isOwned)
                        mut.set(hex, tile.incrementPop())
                })
            )
        if ((turn + 1) % this.opts.roundTicks === 0)
            result = result.withMutations(mut =>
                result.forEach((tile, hex) => {
                    if (tile.terrain === Terrain.Empty && tile.isOwned)
                        mut.set(hex, tile.incrementPop())
                })
            )
        return orig.setTiles(result)
    }
}