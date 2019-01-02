import {Board} from './Board';
import {Terrain} from './Terrain';

const COUNTRYSIDE_TURNS = 50
const CITY_TURNS = 2

export class PopStepper {
    constructor(
        readonly cityTurns: number = CITY_TURNS,
        readonly countrysideTurns: number = COUNTRYSIDE_TURNS,
    ) {}

    step(orig: Board, turn: number): Board {
        let result = orig.explicitTiles
        // TODO consider using a single loop
        if (turn % this.cityTurns === 0)
            result = result.withMutations(mut =>
                result.forEach((tile, hex) => {
                    if (tile.growsFast && tile.isOwned)
                        mut.set(hex, tile.incrementPop())
                })
            )
        if (turn % this.countrysideTurns === 0)
            result = result.withMutations(mut =>
                result.forEach((tile, hex) => {
                    if (tile.terrain === Terrain.Empty && tile.isOwned)
                        mut.set(hex, tile.incrementPop())
                })
            )
        return orig.setTiles(result)
    }
}