import {Map} from 'immutable'

import {Hex} from './Hex'
import {Board} from './Board'
import {Tile} from './Tile'
import {StatusMessage} from '../../../common/StatusMessage';

export class Arranger {
    // return a set of explicitTiles to overlay on board — blank explicitTiles will be ignored
    arrange(
        board: Board,
        status: StatusMessage[] | undefined = undefined,
    ): Map<Hex, Tile> {
        throw new Error('not implemented')
    }
}
export const MAP_TOO_SMALL = 'map too small'