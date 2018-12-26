import {Map} from 'immutable'

import {HexCoord} from './HexCoord'
import {Board} from './Board'
import {Spot} from './Spot'
import {StatusMessage} from '../../../common/StatusMessage';

export class Arranger {
    arrange(
        board: Board,
        status: StatusMessage[] | undefined = undefined,
    ): Map<HexCoord, Spot> {
        throw new Error('not implemented')
    }
}
export const MAP_TOO_SMALL = 'map too small'