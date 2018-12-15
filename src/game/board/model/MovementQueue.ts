// A list of planned movements, organized by player
import {List, Map} from 'immutable'
import {HexCoord} from './HexCoord'
import {Player} from '../../players/Players'
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
        const tmp: List<PlayerMove> = List()
        const mutMap = this.playerQueues.asMutable()
        let mutated = false
        const playerMoves = tmp.withMutations(result =>
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

    // Cancel most recent moves -- count = -1 to cancel all of a player's moves.
    // If there are no moves to cancel, return undefined.
    // Otherwise return the updated movement queue plus a single-element list
    // containing the cancelled move.
    cancelMoves(player: Player, count: number): QueueAndMoves | undefined {
        const moves: List<PlayerMove> | undefined = this.playerQueues.get(player)
        if (moves && moves.size > 0 && count !== 0) {
            // bug workaround
            // TODO check immutable.js future versions - does cancel work with line removed?
            moves.asImmutable()
            // console.log(`--> immutable? ${moves.asImmutable() === moves}`)
            // console.log(`--> mutable? ${moves.asMutable() === moves}`)
            const actualCount = (count < 0 || count > moves.size) ? moves.size : count
            // console.log(`*** actual count ${actualCount} out of ${moves.size} -- ${moves}`)
            // console.log(`  * Still here? ${moves}`)
            const cancelledMoves: List<PlayerMove> = List(moves.slice(-actualCount))
            // console.log(`  * Still here? ${moves}`)
            const remainingMoves: List<PlayerMove> = List(moves.slice(0, -actualCount))
            // console.log(`  * Still here? ${moves}`)
            // console.log(`  * filtered true: ${moves.filter(() => true)}`)
            // const cancelledMoves = moves.slice(-1)
            // const remainingMoves = moves.slice(0, -1)
            // console.log(`  * cancelling: ${cancelledMoves}`)
            // console.log(`  * remaining: ${remainingMoves}`)

            // const a: List<string> = List(['a', 'b', 'c', 'd', 'e'])
            // console.log(`--- all: ${a}`)
            // console.log(`--- slice -1: ${a.slice(-1)}`)

            return new QueueAndMoves(
                new MovementQueue(
                    this.playerQueues.set(player, List(remainingMoves))
                ),
                cancelledMoves
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