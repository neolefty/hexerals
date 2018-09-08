// A list of planned movements, organized by player
import {List, Map} from 'immutable';
import {HexCoord} from './Hex';

export class HexMove {
    constructor(
        readonly source: HexCoord,
        readonly delta: HexCoord,
    ) {}

    get dest(): HexCoord {
        return this.source.plus(this.delta);
    }

    public toString(): string {
        return `move from ${this.source} to ${this.dest}`;
    }
}

export class PlayerMove {
    constructor(
        readonly  move: HexMove,
        readonly playerIndex: number,
    ) {}

    get source(): HexCoord { return this.move.source; }
    get delta(): HexCoord { return this.move.delta; }
    get dest(): HexCoord { return this.move.dest; }

    public toString(): string {
        return `Player #${this.playerIndex} ${this.move}`;
    }
}

export class MovementQueue {
    constructor(
        readonly playerQueues: Map<number, List<HexMove>>
    ) {}

    public add(playerIndex: number, move: HexMove): MovementQueue {
        if (this.playerQueues.has(playerIndex))
            return new MovementQueue(
                // add move to the end of this player's queue
                this.playerQueues.set(
                    playerIndex,
                    this.playerQueues.get(playerIndex).push(move),
                )
            );
        else
            return new MovementQueue(
                // create a new queue for this player, with 1 move in it
                this.playerQueues.set(playerIndex, List([move]))
            );
    }

    public get size(): number {
        return this.playerQueues.reduce(
            (n: number, q: List<HexMove>): number => n + q.size,
            0,
        );
    }

    public toString(): string {
        return this.playerQueues.toString();
    }

/*
    public pop(playerIndex: number): MoveAndQueue {
        if (!this.playerQueues.has(playerIndex))
            // no queue for that player (no worries though -- just means no moves)
            return new MoveAndQueue(this, undefined);
        else {
            const playerQueue: List<HexMove> = this.playerQueues.get(playerIndex);
            if (playerQueue.size == 0)
                // no moves in that player's queue
                return new MoveAndQueue(this, undefined);
            else
                return new MoveAndQueue(
                    new MovementQueue(
                        this.playerQueues.set(playerIndex, playerQueue.remove(0))
                    ),
                    playerQueue.get(0),
                );
        }
    }
*/

    // pop moves of each player in sequence, starting with startPlayerIndex and
    // going in a circle to startPlayerIndex - 1.
    public popEach(startPlayerIndex: number, numPlayers: number):
        QueueAndMoves | undefined
    {
        const c: List<PlayerMove> = List();
        const mutMap = this.playerQueues.asMutable();
        const playerMoves = c.withMutations(result => {
            for (let playerIdx = 0; playerIdx < numPlayers; ++playerIdx)
                if (mutMap.has(playerIdx)) {
                    const moves = mutMap.get(playerIdx);
                    if (moves.size > 0) {
                        result.push(new PlayerMove(moves.get(0), playerIdx));
                        mutMap.set(playerIdx, moves.remove(0));
                    }
                }
        });
        if (playerMoves.size === 0)
            return undefined; // no change
        else
            return new QueueAndMoves(
                new MovementQueue(mutMap.asImmutable()),
                playerMoves,
            );
    }
}

export const EMPTY_MOVEMENT_QUEUE = new MovementQueue(Map());

/*
// helper types
export class MoveAndQueue {
    constructor(
        readonly queue: MovementQueue,
        readonly move?: HexMove,
    ) {}
}
*/

export class QueueAndMoves {
    constructor(
        readonly queue: MovementQueue,
        readonly moves: List<PlayerMove>,
    ) {}

    toString = (): string =>
        `queue: ${this.queue}; moves: ${this.moves}`;
}