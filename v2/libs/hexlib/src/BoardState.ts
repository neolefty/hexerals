import { Board } from "./lib/Board"
import { Hex } from "./lib/Hex"
import { StatusMessage } from "./lib/StatusMessage"
import { Player } from "./lib/Player"
import { Capture } from "./lib/Capture"
import { MovementQueue } from "./lib/MovementQueue"
import { GamePhase } from "./lib/GamePhase"

export interface BoardState {
    board: Board
    turn: number
    cursors: ReadonlyMap<number, Hex>
    moves: MovementQueue
    players: PlayerManager
    messages: ReadonlyArray<StatusMessage>
    phase: GamePhase
    stats: StatHistory
    curPlayer?: Player
    captures?: ReadonlyArray<Capture>
}

export const DEFAULT_CURSORS: ReadonlyMap<number, Hex> = new Map<number, Hex>([
    [0, Hex.NONE],
])

export const BOARD_STATE_STARTER: Partial<BoardState> = Object.freeze({
    turn: 0,
    cursors: DEFAULT_CURSORS,
    moves: MovementQueue.EMPTY,
    messages: [],
    phase: GamePhase.BeforeStart,
    stats: StatHistory.EMPTY,
})

export const boardStateToString = (s: BoardState): string =>
    "" +
    `cursors: ${List<[number, Hex]>(s.cursors.entries())
        .map(([i, hex]) => `${i}:${hex.toString()}`)
        .toArray()}\n` +
    `players: ${s.players.toString()} (current: ${s.curPlayer})\n` +
    `board: ${s.board.toString()}\n` +
    `moves: ${s.moves}\n` +
    `messages: ${s.messages}\n` +
    `turn: ${s.turn}\n` +
    `phase: ${s.phase}\n` +
    (s.captures && s.captures.size > 0
        ? `captures: ${s.captures.join("\n          ")}\n`
        : "")

export const curPlayerTileCount = (state: BoardState) =>
    (state.curPlayer !== undefined &&
        state.board.getHexStatistics().get(state.curPlayer, 0)) ||
    0

export const isVictory = (state: BoardState) =>
    state.phase === GamePhase.Ended && curPlayerTileCount(state) > 0

export const isDefeat = (state: BoardState) => curPlayerTileCount(state) === 0

// win, lose, or none
export const analyticsLabel = (
    state: BoardState
): AnalyticsLabel | undefined => {
    if (isVictory(state)) return AnalyticsLabel.win
    else if (isDefeat(state)) return AnalyticsLabel.lose
    else return undefined
}
