import {Map} from 'immutable'

import {HexCoord} from './HexCoord'
import {Board} from './Board'
import {Tile} from './Tile'
import {StatusMessage} from '../../../common/StatusMessage';

export class Arranger {
    arrange(
        board: Board,
        status: StatusMessage[] | undefined = undefined,
    ): Map<HexCoord, Tile> {
        throw new Error('not implemented')
    }
}
export const MAP_TOO_SMALL = 'map too small'