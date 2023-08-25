import { Hex } from "./Hex"
import { Tile } from "./Tile"
import { Capture } from "./Capture"
import { BoardConstraints } from "./Constraints"
import { PlayerMove } from "./PlayerMove"
import { StatusMessage } from "./StatusMessage"

export class MoveValidatorOptions {
    // the tiles under consideration, which start out as the current board's tiles
    // but may get speculatively reassigned in internal scratch values during validation
    tiles: Map<Hex, Tile>

    // If true, don't invalidate just because there isn't enough population
    // on the tile *now* to move -- there may be enough in the future.
    ignoreSmallPop = false

    // If true, don't invalidate because the current owner doesn't match the
    // player planning the move -- ownership may change before this move happens.
    ignoreTileOwner = false

    // If true, don't invalidate because of mountains etc.
    ignoreOccupiability = false

    constructor(
        tiles: Map<Hex, Tile>,
        // status messages to update to
        readonly status: StatusMessage[] | undefined = undefined,
        // captures to record
        readonly captures: Capture[] = []
    ) {
        this.tiles = tiles
    }
}

export class MoveValidator {
    constructor(readonly constraints: BoardConstraints) {}

    validate(move: PlayerMove, options: MoveValidatorOptions): boolean {
        // in bounds
        if (!this.constraints.inBounds(move.source)) {
            if (options.status)
                options.status.push({
                    tag: "out of bounds",
                    msg: `start ${move.source} is out of bounds`,
                    debug: `${move}`,
                })
            return false
        }
        if (!this.constraints.inBounds(move.dest)) {
            if (options.status)
                options.status.push({
                    tag: "out of bounds",
                    msg: `destination ${move.dest} is out of bounds`,
                    debug: `${move}`,
                })
            return false
        }

        // can be occupied
        if (!options.ignoreOccupiability) {
            const dest = options.tiles.get(move.dest)
            if (dest && !dest.canBeOccupied) {
                if (options.status)
                    options.status.push({
                        tag: "blocked",
                        msg: `destination ${move.dest} is a ${dest.terrain}`,
                        debug: `${move}`,
                    })
                return false
            }
        }

        // move distance == 1
        if (move.delta.maxAbs() !== 1) {
            if (options.status)
                options.status.push({
                    tag: "illegal move" /* TODO use constants for tags*/,
                    msg: `Can't move ${move.delta.maxAbs()} steps.`,
                    debug: `${move}`,
                })
            return false
        }

        // owner === player making the move
        const origin = options.tiles.get(move.source) || Tile.EMPTY
        if (!options.ignoreTileOwner && origin.owner !== move.player) {
            if (options && options.status)
                options.status.push({
                    tag: "wrong player", // TODO use constant
                    msg:
                        `${move.player} cannot move from ${move.source} ` +
                        `because it is held by ${origin.owner}.`,
                    debug: `${move}`,
                })
            return false
        }

        // population >= 1
        if (!options.ignoreSmallPop && origin.pop <= 1) {
            if (options && options.status)
                options.status.push({
                    tag: "insufficient population",
                    msg: `${move.source} has population of ${origin.pop}`,
                    debug: `${move}`,
                })
            return false
        }

        return true
    }

    // Do some moves.
    // Mutates options.messages and options.tiles.
    // Invalid moves are skipped.
    applyMoves(
        moves: ReadonlyArray<PlayerMove>,
        options: MoveValidatorOptions
    ) {
        moves.forEach((move: PlayerMove) => {
            const valid = this.validate(move, options)
            if (valid) {
                const origin = options.tiles.get(move.source) as Tile
                const newSourceTile = origin.setPop(1)
                // TODO support moving only part of a stack (half etc)
                const oldDestTile = options.tiles.get(move.dest) || Tile.EMPTY
                const march = new Tile(origin.owner, origin.pop - 1)
                const newDestTile = oldDestTile.settle(march)
                const isCapture = oldDestTile.owner !== newDestTile.owner
                // do the move
                options.tiles = options.tiles.withMutations(
                    (m: Map<Hex, Tile>) => {
                        m.set(move.source, newSourceTile)
                        m.set(move.dest, newDestTile)
                    }
                )
                if (isCapture)
                    options.captures.push(
                        new Capture(move.dest, oldDestTile, newDestTile)
                    )
                // was it a capital capture?
                if (isCapture && oldDestTile.terrain === "Capital")
                    options.tiles = options.tiles.withMutations((m) =>
                        options.tiles
                            .filter(
                                (tile) =>
                                    !!(tile && tile.owner === oldDestTile.owner)
                            )
                            .forEach((tile, hex) => {
                                // give territory to attacker, with half pop (rounded up)
                                const capTile = tile
                                    .setOwner(move.player)
                                    .setPop(Math.ceil(tile.pop * 0.5))
                                options.captures.push(
                                    new Capture(hex, tile, capTile)
                                )
                                m.set(hex, capTile)
                            })
                    )
            }
        })
    }
}
