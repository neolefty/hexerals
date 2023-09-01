import {Map} from 'immutable'

import {Hex} from '../hex/Hex'
import {Board} from '../board/Board'
import {Tile} from '../hex/Tile'
import {StatusMessage} from '../../../common/StatusMessage';

export abstract class TileArranger {
    // tiles to overlay on board — blank tiles will be ignored
    abstract arrange(
        board: Board,
        status?: StatusMessage[],
    ): Map<Hex, Tile>
}
// a status message tag
export const TAG_MAP_TOO_SMALL = 'map too small'