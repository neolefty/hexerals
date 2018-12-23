import * as assert from 'assert';
import {StatusMessage} from '../../../common/StatusMessage';
import {Spot, Terrain} from './Spot';
import {List, Map} from 'immutable';
import {HexCoord} from './HexCoord';
import {PlayerMove} from './Move';
import {BoardConstraints} from './Constraints';

export class MoveValidatorOptions {
    // the spots under consideration, which start out as the current board's spots
    // but may get speculatively reassigned in internal scratch values during validation
    spots: Map<HexCoord, Spot>

    // If true, don't invalidate just because there isn't enough population
    // in the spot *now* to move -- there may be enough in the future.
    ignoreSmallPop: boolean = false

    // If true, don't invalidate because the current owner doesn't match the
    // player planning the move -- ownership may change before this move happens.
    ignoreSpotOwner: boolean = false

    // If true, allow moving into a mountain since it might be a city due to fog of war.
    ignoreMountains: boolean = false

    constructor(
        spots: Map<HexCoord, Spot>,
        // status messages to add to
        readonly status: StatusMessage[] | undefined = undefined,
    ) {
        this.spots = spots
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

        // not a mountain
        if (!options.ignoreMountains) {
            const dest = options.spots.get(move.dest)
            if (dest && dest.terrain === Terrain.Mountain) {
                if (options.status)
                    options.status.push(
                        new StatusMessage(
                            'mountain',
                            `destination ${move.dest} is a mountain`,
                            `${move}`,
                        ))
                return false
            }
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
        const origin = options.spots.get(move.source, Spot.BLANK)
        if (!options.ignoreSpotOwner && origin.owner !== move.player) {
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
    // Mutates options.messages and options.spots.
    // Invalid moves are skipped.
    applyMoves(moves: List<PlayerMove>, options: MoveValidatorOptions) {
        moves.forEach((move: PlayerMove) => {
            const valid = this.validate(move, options)
            if (valid) {
                const origin = options.spots.get(move.source)
                assert(origin)
                const newSourceSpot = origin.setPop(1)
                // TODO support moving only part of a stack (half etc)
                const oldDestSpot = options.spots.get(move.dest, Spot.BLANK)
                const march = new Spot(origin.owner, origin.pop - 1)
                const newDestSpot = oldDestSpot.settle(march)
                options.spots = options.spots.withMutations(
                    (m: Map<HexCoord, Spot>) => {
                        m.set(move.source, newSourceSpot)
                        m.set(move.dest, newDestSpot)
                    })
            }
        })
    }
}