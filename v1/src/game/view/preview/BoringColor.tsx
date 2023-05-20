import {DriftColor} from '../../../color/DriftColor'
import {CieColor} from '../../../color/CieColor'
import {BoardState} from '../../model/board/BoardState'
import {List, Map, Set} from 'immutable'
import {Player} from '../../model/players/Players'

const [ MIN_BORING, MAX_BORING ] = [ 5, 45 ]
const MID_BORING = (MIN_BORING + MAX_BORING) * .5
const randomLightness = () =>
    MIN_BORING + Math.random() * (MAX_BORING - MIN_BORING)

class BoringColor extends DriftColor {
    constructor(lightness?: number) {
        super(new CieColor([0, 0, Math.min(MAX_BORING,
            lightness === undefined ? randomLightness() : lightness
        )]))
    }

    contrast(): BoringColor {
        return new BoringColor(
            this.lightness > MID_BORING ? MIN_BORING : MAX_BORING
        )
    }

    texture(diff: number = 20): DriftColor {
        return super.texture(diff / 2)
    }
}

let prevGrey = Map<Player, DriftColor>()
let prevGreyPlayers = Set<Player>()

export const greyColors = (bs: BoardState): Map<Player, DriftColor> => {
    const intersectPlayers = prevGreyPlayers.sort().intersect(
        List(bs.players.playerIndexes.keys()).sort()
    )
    if (intersectPlayers.size !== bs.players.size) {
        prevGrey = bs.players.playerIndexes.map(
            () => new BoringColor()
        ).set(
            // dark background
            Player.Nobody,
            DriftColor.constructHSL(0, 0, 20)
        )
        prevGreyPlayers = Set<Player>(prevGrey.keys())
    }
    return prevGrey
}