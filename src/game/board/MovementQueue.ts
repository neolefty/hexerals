// A list of planned movements, organized by player
import {List, Map} from 'immutable'
import {HexCoord} from './Hex'
import {Player} from '../players/Players'

export class HexMove {
    constructor(
        readonly source: HexCoord,
        readonly delta: HexCoord,
    ) {}

    get dest(): HexCoord {
        return this.source.plus(this.delta)
    }

    public toString(): string {
        return `move from ${this.source} to ${this.dest}`
    }
}

export class PlayerMove {
    static construct(player: Player, source: HexCoord, delta: HexCoord): PlayerMove {
        return new PlayerMove(player, new HexMove(source, delta))
    }

    constructor(
        readonly player: Player,
        readonly  move: HexMove,
    ) {}

    get source(): HexCoord { return this.move.source }
    get delta(): HexCoord { return this.move.delta }
    get dest(): HexCoord { return this.move.dest }

    public toString(): string {
        return `${this.player} ${this.move}`
    }
}

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

/*
    public pop(playerIndex: number): MoveAndQueue {
        if (!this.playerQueues.has(playerIndex))
            // no queue for that player (no worries though -- just means no moves)
            return new MoveAndQueue(this, undefined)
        else {
            const playerQueue: List<HexMove> = this.playerQueues.get(playerIndex)
            if (playerQueue.size == 0)
                // no moves in that player's queue
                return new MoveAndQueue(this, undefined)
            else
                return new MoveAndQueue(
                    new MovementQueue(
                        this.playerQueues.set(playerIndex, playerQueue.remove(0))
                    ),
                    playerQueue.get(0),
                )
        }
    }
*/

    // pop moves of all players invalid moves are skipped (they can arise
    // from out-of-date queueing, so discard them and move on)
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