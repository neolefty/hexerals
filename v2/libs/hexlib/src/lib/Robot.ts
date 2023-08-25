import { Player } from "./Player"
import { PlayerMove } from "./PlayerMove"
import { HexMove } from "./HexMove"
import { BoardState } from "../BoardState"

export interface GameDecision {
    cancelMoves?: number
    makeMoves?: ReadonlyArray<HexMove>
}

export interface Robot {
    decide(
        player: Player,
        bs: BoardState,
        curMoves?: ReadonlyArray<PlayerMove>
    ): GameDecision | undefined
}

export const gameDecisionToString = (gd: GameDecision): string =>
    `${gd.makeMoves ? `moves: ${gd.makeMoves.toString()}` : ""} ${
        gd.cancelMoves ? `cancel: ${gd.cancelMoves}` : ""
    }`
