import * as assert from 'assert';
import {StatusMessage} from '../../../common/StatusMessage';
import {Tile} from './Tile';
import {List, Map} from 'immutable';
import {Hex} from './Hex';
import {PlayerMove} from './Move';
import {BoardConstraints} from './Constraints';

export class MoveValidatorOptions {
    // the tiles under consideration, which start out as the current board's tiles
    // but may get speculatively reassigned in internal scratch values during validation
    tiles: Map<Hex, Tile>

    // If true, don't invalidate just because there isn't enough population
    // on the tile *now* to move -- there may be enough in the future.
    ignoreSmallPop: boolean = false

    // If true, don't invalidate because the current owner doesn't match the
    // player planning the move -- ownership may change before this move happens.
    ignoreTileOwner: boolean = false

    constructor(
        tiles: Map<Hex, Tile>,
        // status messages to add to
        readonly status: StatusMessage[] | undefined = undefined,
    ) {
        this.tiles = tiles
    }
}

export class MoveValidator {
    constructor(
        readonly constraints: BoardConstraints
    ) {}

    validate(move: PlayerMove, options: MoveValidatorOptions): boolean {
        // in bounds
        if (!this.constraints.inBounds(move.source)) {
            if (options.status)
                options.status.push(
                    new StatusMessage(
                        'out of bounds',
                        `start ${move.source} is out of bounds`,
                        `${move}`,
                    ))
            return false
        }
        if (!this.constraints.inBounds(move.dest)) {
            if (options.status)
                options.status.push(
                    new StatusMessage(
                        'out of bounds',
                        `destination ${move.dest} is out of bounds`,
                        `${move}`,
                    ))
            return false
        }

        // can be occupied
        const dest = options.tiles.get(move.dest)
        if (dest && !dest.canBeOccupied()) {
            if (options.status)
                options.status.push(
                    new StatusMessage(
                        'blocked',
                        `destination ${move.dest} is a ${dest.terrain}`,
                        `${move}`,
                    ))
            return false
        }

        // move distance == 1
        if (move.delta.maxAbs() !== 1) {
            if (options.status)
                options.status.push(
                    new StatusMessage(
                        'illegal move', /* TODO use constants for tags*/
                        `Can't move ${move.delta.maxAbs()} steps.`,
                        `${move}`,
                    ))
            return false
        }

        // owner === player making the move
        const origin = options.tiles.get(move.source, Tile.BLANK)
        if (!options.ignoreTileOwner && origin.owner !== move.player) {
            if (options && options.status)
                options.status.push(new StatusMessage(
                    'wrong player', // TODO use constant
                    `${move.player} cannot move from ${move.source} `
                    + `because it is held by ${origin.owner}.`,
                    `${move}`,
                ))
            return false
        }

        // population >= 1
        if (!options.ignoreSmallPop && origin.pop <= 1) {
            if (options && options.status)
                options.status.push(new StatusMessage(
                    'insufficient population',
                    `${move.source} has population of ${origin.pop}`,
                    `${move}`,
                ))
            return false
        }

        return true
    }

    // Do some moves.
    // Mutates options.messages and options.tiles.
    // Invalid moves are skipped.
    applyMoves(moves: List<PlayerMove>, options: MoveValidatorOptions) {
        moves.forEach((move: PlayerMove) => {
            const valid = this.validate(move, options)
            if (valid) {
                const origin = options.tiles.get(move.source)
                assert(origin)
                const newSourceTile = origin.setPop(1)
                // TODO support moving only part of a stack (half etc)
                const oldDestTile = options.tiles.get(move.dest, Tile.BLANK)
                const march = new Tile(origin.owner, origin.pop - 1)
                const newDestTile = oldDestTile.settle(march)
                options.tiles = options.tiles.withMutations(
                    (m: Map<Hex, Tile>) => {
                        m.set(move.source, newSourceTile)
                        m.set(move.dest, newDestTile)
                    })
            }
        })
    }
}