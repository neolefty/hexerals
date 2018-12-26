import {Board} from './Board';
import {Terrain} from './Spot';

const COUNTRYSIDE_TURNS = 50
const CITY_TURNS = 2

export class PopStepper {
    constructor(
        readonly cityTurns: number = CITY_TURNS,
        readonly countrysideTurns: number = COUNTRYSIDE_TURNS,
    ) {}

    step(orig: Board, turn: number): Board {
        let result = orig.explicitSpots
        // TODO consider using a single loop
        if (turn % this.cityTurns === 0)
            result = result.withMutations(mut =>
                result.forEach((spot, hex) => {
                    if (spot.terrain === Terrain.City && spot.isOwned)
                        mut.set(hex, spot.incrementPop())
                })
            )
        if (turn % this.countrysideTurns === 0)
            result = result.withMutations(mut =>
                result.forEach((spot, hex) => {
                    if (spot.terrain === Terrain.Empty && spot.isOwned)
                        mut.set(hex, spot.incrementPop())
                })
            )
        return orig.setSpots(result)
    }
}