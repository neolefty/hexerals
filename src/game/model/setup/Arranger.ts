import {Map} from 'immutable'

import {Hex} from '../hex/Hex'
import {Board} from '../board/Board'
import {Tile} from '../hex/Tile'
import {StatusMessage} from '../../../common/StatusMessage';

export class Arranger {
    // return a set of tiles to overlay on board — blank tiles will be ignored
    arrange(
        board: Board,
        status: StatusMessage[] | undefined = undefined,
    ): Map<Hex, Tile> {
        throw new Error('not implemented')
    }
}
export const MAP_TOO_SMALL = 'map too small'