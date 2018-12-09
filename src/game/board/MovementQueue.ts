// A list of planned movements, organized by player
import {List, Map} from 'immutable'
import {HexCoord} from './HexCoord'
import {Player} from '../players/Players'
import {PlayerMove} from './Move';

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
        const c: List<PlayerMove> = List()
        const mutMap = this.playerQueues.asMutable()
        let mutated = false
        const playerMoves = c.withMutations(result =>
            this.playerQueues.forEach(
                (moves: List<PlayerMove>, player: Player) => {
                    const mutMoves: List<PlayerMove> = moves.asMutable()
                    mutMap.set(player, mutMoves)
                    while (mutMoves.size > 0) {
                        mutated = true
                        const move: PlayerMove = mutMoves.get(0)
                        mutMoves.remove(0)
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

    playerIsQueuedTo(player: Player, hex: HexCoord): boolean {
        const moves: List<PlayerMove> | undefined = this.playerQueues.get(player)
        return !!(moves && moves.find(
            (move: PlayerMove) => move.dest === hex)
        )
    }

    playerHasMove(player: Player) {
        return this.playerQueues.has(player) && this.playerQueues.get(player).size > 0
    }

    // If there are no moves to cancel, return undefined;
    // otherwise return the updated movement queue plus a single-element list
    // containing the cancelled move
    cancelLastMove(player: Player): QueueAndMoves | undefined {
        const moves: List<PlayerMove> | undefined = this.playerQueues.get(player)
        if (moves && moves.size > 0) {
            const cancelledMove = moves.get(moves.size - 1)
            return new QueueAndMoves(
                new MovementQueue(
                    this.playerQueues.set(player, moves.pop())
                ),
                List([cancelledMove])
            )
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