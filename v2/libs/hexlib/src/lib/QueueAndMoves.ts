import { MovementQueue } from "./MovementQueue"
import { PlayerMove } from "./PlayerMove"

export interface QueueAndMoves {
    queue: MovementQueue
    moves: ReadonlyArray<PlayerMove>
}
