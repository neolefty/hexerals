import {StatusMessage} from '../../../common/StatusMessage';
import {Spot} from './Spot';
import {Map} from 'immutable';
import {HexCoord} from './HexCoord';
import {PlayerMove} from './Move';
import {BoardConstraints} from './Constraints';

export class MoveValidatorOptions {
    // the spots under consideration, which start out as the current board's spots
    // but may get speculatively reassigned in internal scratch values during validation
    spots: Map<HexCoord, Spot>

    ignoreSmallPop: boolean = false
    ignoreCurPlayer: boolean = false
    ignoreSpotOwner: boolean = false

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
            if (options && options.status)
                options.status.push(
                    new StatusMessage(
                        'out of bounds',
                        `start ${move.source} is out of bounds`,
                        `${move}`,
                    ))
            return false
        }
        if (!this.constraints.inBounds(move.dest)) {
            if (options && options.status)
                options.status.push(
                    new StatusMessage(
                        'out of bounds',
                        `destination ${move.dest} is out of bounds`,
                        `${move}`,
                    ))
            return false
        }

        // move distance == 1
        if (move.delta.maxAbs() !== 1) {
            if (options && options.status)
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
}