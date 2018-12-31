import {List} from 'immutable';

import {GameDecision, Robot} from './Robot';
import {HexMove, PlayerMove} from '../Move';
import {BoardState} from '../BoardState';
import {Player} from './Players';
import {Hex} from '../Hex';
import {Tile} from '../Tile';
import {Board} from '../Board';
import * as assert from 'assert';

// improvements
// * parameterize intelligence -- a vector of booleans or numbers that can be randomly modified
// * specify robot intelligence in options
// * don't make losing moves
// * if you're next to a city and can take it
// * bias towards initial capture
// * test that smarter always wins

const NONE_MOVE = new HexMove(Hex.NONE, Hex.NONE)

export class BasicRobotSettings {
    static readonly MAX_INTELLIGENCE = 3

    static byIntelligence(intelligence: number): BasicRobotSettings {
        assert(intelligence <= BasicRobotSettings.MAX_INTELLIGENCE)
        let settings: boolean[] = Array(
            BasicRobotSettings.MAX_INTELLIGENCE).fill(false)
        while (settings.filter(value => value).length < intelligence)
            settings[Math.floor(
                Math.random() * this.MAX_INTELLIGENCE
            )] = true
        return new BasicRobotSettings(...settings)
    }

    constructor(
        readonly stopPartway: boolean = true, // doesn't always move until blocked
        readonly wasteNot: boolean = true, // avoids losing moves
        readonly captureNearby: boolean = true, // grabs cities if it can
    ) {}

    get intelligence() {
        return (this.stopPartway ? 1 : 0)
            + (this.wasteNot ? 1 : 0)
            + (this.captureNearby ? 1 : 0)
    }

    toString(includeNegatives: boolean = true) {
        return `IQ ${this.intelligence} — ${
            this.stopPartway ? 'stops partway'
                : includeNegatives ? 'never stops' : ''}, ${
            this.wasteNot ? 'doesn\'t waste'
                : includeNegatives ? 'wastes' : ''}, ${
            this.captureNearby ? 'captures nearby'
                : includeNegatives ? 'ignores nearby' : '' }`
    }
}

export class BasicRobot implements Robot {
    static byIntelligence(intelligence: number): BasicRobot {
        return new BasicRobot(BasicRobotSettings.byIntelligence(intelligence))
    }

    static byArray(booleans: boolean[]) {
        assert(booleans.length <= BasicRobotSettings.MAX_INTELLIGENCE)
        return new BasicRobot(new BasicRobotSettings(...booleans))
    }

    constructor(
        readonly settings: BasicRobotSettings
    ) {}

    decide(
        player: Player, bs: BoardState, curMoves?: List<PlayerMove>
    ): GameDecision | undefined {
        let result: GameDecision = {}
        // we should queue moves if there aren't any queued currently
        let shouldQueue: boolean = !curMoves || curMoves.size === 0

        // avoid losing battles?
        if (this.settings.wasteNot && curMoves && curMoves.size > 0) {
            const nextMove = curMoves.get(0) as PlayerMove
            const source = bs.board.getTile(nextMove.source)
            const dest = bs.board.getTile(nextMove.dest)
            // is this a losing battle?
            if (dest.owner !== player && dest.pop >= source.pop - 1) {
                result.cancelMoves = curMoves.size
                shouldQueue = true
            }
        }

        // capture a nearby city, if we're stopped anyway
        if (shouldQueue && this.settings.captureNearby) {
            bs.board.filterTiles(
                tile => tile.owner === player
            ).forEach(myHex => {
                const myTile = bs.board.getTile(myHex)
                bs.board.forNeighborsInBounds(
                    myHex, (neighborHex, neighborTile) => {
                        if (
                            neighborTile.owner !== player
                            && neighborTile.growsFast()
                            && neighborTile.pop <= myTile.pop - 1
                        ) {
                            result.makeMoves = List([
                                new HexMove(myHex, neighborHex.minus(myHex))
                            ])
                            shouldQueue = false
                        }
                    }
                )
            })
        }

        // queue moves in a random direction if appropriate
        if (shouldQueue) {
            let totalPop = 0
            let chosenMove: HexMove = NONE_MOVE
            forEachSetOfStarts(
                bs.board,
                player,
                (orig: Hex, dests: List<Hex>) => {
                    const origTile = bs.board.getTile(orig)
                    // I think this is a shortcut to giving each move a fair weight
                    const takeIt: boolean =
                        (Math.random() * (totalPop + origTile.pop)) > totalPop
                    if (takeIt) {
                        const dest = dests.get(Math.floor(Math.random() * dests.size))
                        chosenMove = new HexMove(orig, dest.minus(orig))
                    }
                    totalPop += origTile.pop
                }
            )
            if (chosenMove !== NONE_MOVE) {
                const delta = chosenMove.delta
                let moves: List<HexMove> = List()
                let pos: Hex = chosenMove.source
                let dest = chosenMove.dest
                do {
                    moves = moves.push(new HexMove(pos, delta))
                    pos = dest
                    dest = dest.plus(delta)
                } while (bs.board.canBeOccupied(dest))
                // randomly shorten the move queue, biased towards longer
                if (moves.size > 1 && this.settings.stopPartway) {
                    const movesToDrop = Math.floor(
                        Math.random() * Math.random() * moves.size
                    )
                    moves = moves.slice(0, moves.size - movesToDrop) as List<HexMove>
                    assert(moves.size >= 1)
                }
                result.makeMoves = moves
            }
        }

        return result
    }

    toString() { return this.settings.toString(false) }
}

const forEachSetOfStarts = (
    board: Board,
    player: Player,
    sideEffect: (orig: Hex, dests: List<Hex>) => void
): void => {
    board.explicitTiles.forEach((tile: Tile, orig: Hex) => {
        if (tile.owner === player && tile.pop > 1) {
            const dests = orig.neighbors.filter((dest: Hex) =>
                board.canBeOccupied(dest)
            ) as List<Hex>
            if (dests.size > 0)
                sideEffect(orig, dests)
        }
    })
}