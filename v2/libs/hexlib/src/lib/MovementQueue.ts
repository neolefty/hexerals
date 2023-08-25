import { Player } from "./Player"
import { PlayerMove } from "./PlayerMove"
import { QueueAndMoves } from "./QueueAndMoves"
import { Hex } from "./Hex"
import { devAssert } from "./Environment"

export class MovementQueue {
    static readonly EMPTY = new MovementQueue()

    constructor(
        readonly playerQueues: Readonly<
            Record<Player, ReadonlyArray<PlayerMove>>
        > = {}
    ) {}

    /** Append a move to a player's queue. */
    public addMove(move: PlayerMove): MovementQueue {
        const oldMoves = this.playerQueues[move.player] || []
        return new MovementQueue(
            // add move to the end of this player's queue
            {
                ...this.playerQueues,
                [move.player]: [...oldMoves, move],
            }
        )
    }

    /**
     * Narrow this list of movement queues down to a single player.
     * Useful for displaying a single-player view.
     */
    public onlyForPlayer(player: Player): MovementQueue {
        return new MovementQueue({
            [player]: this.playerQueues[player] || [],
        })
    }

    public get size(): number {
        return Object.values(this.playerQueues).reduce(
            (sum, x) => sum + x.length,
            0
        )
    }

    public toString(): string {
        return `{${Object.entries(this.playerQueues)
            .map(
                ([player, moves]) =>
                    `${player}: ${moves
                        .map((move) => move.toString())
                        .join(", ")}`
            )
            .join(", ")}}`
    }

    /**
     * Pop moves of all players — that is, remove any invalid moves from the head of a player's queue, plus
     * the first valid move, and return both the updated player move queues and the list of valid moves to be made.
     * Note: Invalid moves are discarded without complaint because they may arise legitimately from an out-of-date
     * picture of the board such as moving from a spot that a player used to own but no longer does.
     *
     * @return undefined if no changes
     */
    public popEach(
        validator: (move: PlayerMove) => boolean
    ): QueueAndMoves | undefined {
        const scratchQueues: Record<Player, PlayerMove[]> = {}
        let mutated = false
        // moves that have been chosen to be actually made, because they are the next valid moves found in the queue
        const moves: PlayerMove[] = []
        // TODO do this with Structura
        Object.entries(this.playerQueues).forEach(([player, playerMoves]) => {
            const playerMovesScratch = [...playerMoves]
            while (playerMovesScratch.length) {
                mutated = true
                const move = playerMovesScratch.shift()!
                if (validator(move)) {
                    moves.push(move)
                }
            }
            if (playerMovesScratch.length)
                scratchQueues[Number(player)] = playerMovesScratch
        })
        if (!mutated) return undefined // no change
        else
            return {
                moves,
                queue: new MovementQueue(scratchQueues),
            }
    }

    playerIsQueuedTo(player: Player, hex: Hex): boolean {
        const moves = this.playerQueues[player]
        // noinspection PointlessBooleanExpressionJS
        return !!(moves && moves.find((move) => !!(move && move.dest === hex)))
    }

    playerHasMove(player: Player) {
        return (this.playerQueues[player]?.length || 0) > 0
    }

    /**
     * Cancel most recent moves for a given player and cursor.
     * @param player the player whose moves to cancel
     * @param cursorIndex the cursor whose moves should be cancelled
     * @param count number of moves to cancel; -1 to cancel all.
     * @return updated movement queue plus array of cancelled moves, in order from oldest to newest — or undefined if no effect (no moves to cancel, etc).
     */
    cancelMoves(
        player: Player,
        cursorIndex: number,
        count: number
    ): QueueAndMoves | undefined {
        const moves = this.playerQueues[player]
        if (!moves) return undefined

        if (moves.length === 0 || count === 0) return undefined
        if (count < 0) count = moves.length

        const cancelled: PlayerMove[] = []
        const updatedMoves = [...moves]
        // important: we're walking backwards down the list ...
        for (
            let i = updatedMoves.length - 1;
            i >= 0 && cancelled.length < count;
            --i
        ) {
            const move = moves[i]
            if (cursorIndex === -1 || move.cursorIndex === cursorIndex) {
                // ... so it's okay to remove as we go because we're starting at the high index
                updatedMoves.splice(i, 1)
                cancelled.push(move)
            }
        }

        if (cancelled.length === 0) return undefined // no change
        else {
            devAssert(cancelled.length + updatedMoves.length === moves.length)
            return {
                queue: new MovementQueue({
                    ...this.playerQueues,
                    [player]: updatedMoves,
                }),
                moves: cancelled.reverse(),
            }
        }
    }
}
