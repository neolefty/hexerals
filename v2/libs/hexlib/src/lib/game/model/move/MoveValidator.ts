import { Tile } from "../hex/Tile"
import { List, Map } from "immutable"
import { Hex } from "../hex/Hex"
import { PlayerMove } from "./Move"
import { BoardConstraints } from "../board/Constraints"
import { Terrain } from "../hex/Terrain"
import { Capture } from "./Capture"
import { StatusMessage } from "../../../common/StatusMessage"

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
                options.status.push(
                    new StatusMessage(
                        "out of bounds",
                        `start ${move.source} is out of bounds`,
                        `${move}`
                    )
                )
            return false
        }
        if (!this.constraints.inBounds(move.dest)) {
            if (options.status)
                options.status.push(
                    new StatusMessage(
                        "out of bounds",
                        `destination ${move.dest} is out of bounds`,
                        `${move}`
                    )
                )
            return false
        }

        // can be occupied
        if (!options.ignoreOccupiability) {
            const dest = options.tiles.get(move.dest)
            if (dest && !dest.canBeOccupied) {
                if (options.status)
                    options.status.push(
                        new StatusMessage(
                            "blocked",
                            `destination ${move.dest} is a ${dest.terrain}`,
                            `${move}`
                        )
                    )
                return false
            }
        }

        // move distance == 1
        if (move.delta.maxAbs() !== 1) {
            if (options.status)
                options.status.push(
                    new StatusMessage(
                        "illegal move" /* TODO use constants for tags*/,
                        `Can't move ${move.delta.maxAbs()} steps.`,
                        `${move}`
                    )
                )
            return false
        }

        // owner === player making the move
        const origin = options.tiles.get(move.source, Tile.EMPTY)
        if (!options.ignoreTileOwner && origin.owner !== move.player) {
            if (options && options.status)
                options.status.push(
                    new StatusMessage(
                        "wrong player", // TODO use constant
                        `${move.player} cannot move from ${move.source} ` +
                            `because it is held by ${origin.owner}.`,
                        `${move}`
                    )
                )
            return false
        }

        // population >= 1
        if (!options.ignoreSmallPop && origin.pop <= 1) {
            if (options && options.status)
                options.status.push(
                    new StatusMessage(
                        "insufficient population",
                        `${move.source} has population of ${origin.pop}`,
                        `${move}`
                    )
                )
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
                const origin = options.tiles.get(move.source) as Tile
                const newSourceTile = origin.setPop(1)
                // TODO support moving only part of a stack (half etc)
                const oldDestTile = options.tiles.get(move.dest, Tile.EMPTY)
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
                if (isCapture && oldDestTile.terrain === Terrain.Capital)
                    // noinspection PointlessBooleanExpressionJS
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
