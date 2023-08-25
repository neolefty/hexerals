import { Board } from "./Board"
import { StatusMessage } from "./StatusMessage"
import { Tile } from "./Tile"
import { Hex } from "./Hex"

/** Arrange tiles on a board — generally to set up an initial map. */
export interface TileArranger {
    /**
     * Arrange something on a board, such as player starting positions, mountains, etc.
     *
     * @param board The board to arrange on
     * @param status Optional array of messages to append status updates to
     */
    arrange: (board: Board, status?: StatusMessage[]) => Map<Hex, Tile>
}

export const TAG_MAP_TOO_SMALL = "map too small"
