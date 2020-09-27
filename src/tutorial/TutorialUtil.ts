import {List} from "immutable"
import {BoardState} from "../game/model/board/BoardState"
import {DEFAULT_LOCAL_GAME_OPTIONS, LocalGameOptions} from "../game/model/board/LocalGameOptions"
import {doOpenLocalGame} from "../game/model/cycle/CycleAction"
import {CycleReducer} from "../game/model/cycle/CycleReducer"
import {CycleMode, CycleState, DEFAULT_CYCLE_STATE} from "../game/model/cycle/CycleState"
import {Hex} from "../game/model/hex/Hex"
import {Terrain} from "../game/model/hex/Terrain"
import {Tile} from "../game/model/hex/Tile"
import {Player} from "../game/model/players/Players"

export const initCycle = (options?: Partial<LocalGameOptions>): CycleState => {
    const fullOptions = {...DEFAULT_TUTORIAL_OPTIONS, ...options}
    let result: CycleState = {
        localOptions: fullOptions,
        mode: CycleMode.IN_LOCAL_GAME,
    }
    result = CycleReducer(DEFAULT_CYCLE_STATE, doOpenLocalGame())
    return result
}

export const DEFAULT_TUTORIAL_OPTIONS = {
    ...DEFAULT_LOCAL_GAME_OPTIONS,
    numRobots: 0,
    boardWidth: 7,
    boardHeight: 11,
    difficulty: 0,
}

export const cursorTiles = (board?: BoardState): List<Tile> | undefined => {
    return board?.cursors
        .map(hex => board?.board.getTile(hex))
        .filter(tile => tile !== undefined).toList() as List<Tile>
}

export const hasCapital = (tiles?: List<Tile>): boolean => {
    return tiles?.find(tile => tile.terrain === Terrain.Capital) !== undefined
}

export const tilesOwnedBy = (player: Player, board?: BoardState): List<[Hex, Tile]> =>
    board
        ? List(board.board.filterOwnedTiles(entry => entry[1].owner === player))
        : List()
