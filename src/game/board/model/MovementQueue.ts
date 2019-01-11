// A list of planned movements, organized by player
import {List, Map} from 'immutable'
import {Hex} from './Hex'
import {Player} from './players/Players'
import {PlayerMove} from './Move';
import * as assert from 'assert';

export class MovementQueue {
    constructor(
        readonly playerQueues: Map<Player, List<PlayerMove>> = Map()
    ) {}

    public addMove(move: PlayerMove): MovementQueue {
        if (this.playerQueues.has(move.player))
            return new MovementQueue(
                // add move to the end of this player's queue
                this.playerQueues.set(
                    move.player,
                    this.playerQueues.get(move.player).push(move),
                )
            )
        else
            return new MovementQueue(
                // create a new queue for this player, with 1 move in it
                this.playerQueues.set(move.player, List([move]))
            )
    }

    public onlyForPlayer(player: Player): MovementQueue {
        let newQueues = Map<Player, List<PlayerMove>>()
        return new MovementQueue(
            this.playerQueues.has(player)
                ? newQueues.set(player, this.playerQueues.get(player))
                : newQueues
        )
    }

    public get size(): number {
        return this.playerQueues.reduce(
            (n: number, q: List<PlayerMove>): number => n + q.size,
            0,
        )
    }

    public toString(): string {
        return this.playerQueues.toString()
    }

    // Pop moves of all players.
    // Invalid moves are skipped -- they can arise from out-of-date queueing,
    // so discard them and move on.
    public popEach(validator: ((move: PlayerMove) => boolean)):
        QueueAndMoves | undefined
    {
        const mutMap = this.playerQueues.asMutable()
        let mutated = false
        const playerMoves = List<PlayerMove>().withMutations(result =>
            this.playerQueues.forEach(
                (moves: List<PlayerMove>, player: Player) => {
                    while (moves.size > 0) {
                        mutated = true
                        const move: PlayerMove = moves.get(0)
                        moves = moves.remove(0)
                        mutMap.set(player, moves)
                        if (validator(move)) {
                            result.push(move)
                            break
                        }
                    }
                })
        )
        if (mutated)
            return new QueueAndMoves(
                new MovementQueue(mutMap.asImmutable()),
                playerMoves,
            )
        else // no change
            return undefined
    }

    playerIsQueuedTo(player: Player, hex: Hex): boolean {
        const moves: List<PlayerMove> | undefined = this.playerQueues.get(player)
        return !!(moves && moves.find(
            (move: PlayerMove) => move.dest === hex)
        )
    }

    playerHasMove(player: Player) {
        return this.playerQueues.has(player) && this.playerQueues.get(player).size > 0
    }

    // Cancel most recent moves for a given player and cursor — count = -1 to cancel all of a cursor's moves, -1 to cancel all cursors' moves. If there are no moves to cancel, return undefined. Otherwise return the updated movement queue plus a list containing the cancelled moves, in order from oldest to newest
    cancelMoves(
        player: Player, cursorIndex: number, count: number,
    ): QueueAndMoves | undefined {
        const moves: List<PlayerMove> | undefined
            = this.playerQueues.get(player)
        if (!moves || moves.size === 0 || count === 0)
            return undefined
        if (count < 0) count = moves.size

        const cancelled: PlayerMove[] = []
        let updatedMoves = moves as List<PlayerMove>
        // important: we're walking backwards down the list ...
        for (let i = moves.size - 1; i >= 0 && cancelled.length < count; --i) {
            const move = moves.get(i)
            if (cursorIndex === -1 || move.cursorIndex === cursorIndex) {
                // ... so it's okay to remove as we go
                updatedMoves = updatedMoves.remove(i)
                cancelled.push(move)
            }
        }

        if (cancelled.length > 0) {
            assert.equal(
                cancelled.length + updatedMoves.size,
                moves.size
            )
            return new QueueAndMoves(
                new MovementQueue(
                    this.playerQueues.set(
                        player, updatedMoves.asImmutable()
                    )
                ),
                List<PlayerMove>(cancelled.reverse()))
        }

        else
            return undefined
    }
}

export const EMPTY_MOVEMENT_QUEUE = new MovementQueue(Map())

export class QueueAndMoves {
    constructor(
        readonly queue: MovementQueue,
        readonly moves: List<PlayerMove>,
    ) {}

    toString = (): string =>
        `queue: ${this.queue} moves: ${this.moves}`
}