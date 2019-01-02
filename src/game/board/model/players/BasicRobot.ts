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
    static readonly MAX_INTELLIGENCE = 4

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
        readonly stopByCities: boolean = true, // stops if it's next to a city
    ) {}

    get intelligence() {
        return (this.stopPartway ? 1 : 0)
            + (this.wasteNot ? 1 : 0)
            + (this.captureNearby ? 1 : 0)
            + (this.stopByCities ? 1 : 0)
    }

    get isWatchingNextMove() {
        return this.stopByCities || this.wasteNot
    }

    toString(includeNegatives: boolean = true) {
        return `IQ ${this.intelligence} — ${
            this.stopPartway ? 'stops partway'
                : includeNegatives ? 'never stops' : ''}, ${
            this.wasteNot ? 'wastes not'
                : includeNegatives ? 'wastes' : ''}, ${
            this.captureNearby ? 'captures nearby'
                : includeNegatives ? 'wastes' : ''}, ${
            this.stopByCities ? 'stops by cities'
                : includeNegatives ? 'passes cities' : '' }`
    }
}

export class BasicRobot implements Robot {
    static byIntelligence(intelligence: number): BasicRobot {
        const result = new BasicRobot(BasicRobotSettings.byIntelligence(intelligence))
        console.log(result.toString())
        return result
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

        // queue moves? If there aren't any queued currently ...
        let shouldQueue: boolean = !curMoves || curMoves.size === 0

        // cancel moves?
        if (this.settings.isWatchingNextMove && curMoves && curMoves.size > 0) {
            const nextMove = curMoves.get(0) as PlayerMove
            const source = bs.board.getTile(nextMove.source)
            const dest = bs.board.getTile(nextMove.dest)
            let cancel = false

            // avoid losing battles?
            if (this.settings.wasteNot && !canMoveInto(source, dest))
                cancel = true

            if (this.settings.stopByCities) {
                bs.board.forNeighborsOccupiable(
                    nextMove.source, (neighborHex, neighborTile) =>
                    cancel = cancel || (
                        neighborTile.growsFast && neighborTile.owner !== player
                    )
                )
            }

            if (cancel) {
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
                bs.board.forNeighborsOccupiable(
                    myHex, (neighborHex, neighborTile) => {
                        if (
                            neighborTile.owner !== player
                            && neighborTile.growsFast
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
            this.forEachSetOfStarts(
                bs.board,
                player,
                (source: Hex, dests: List<Hex>) => {
                    const sourceTile = bs.board.getTile(source)
                    // I think this is a shortcut to giving each move a fair weight
                    const takeIt: boolean =
                        (Math.random() * (totalPop + sourceTile.pop)) > totalPop
                    if (takeIt) {
                        const dest = dests.get(Math.floor(Math.random() * dests.size))
                        chosenMove = new HexMove(source, dest.minus(source))
                    }
                    totalPop += sourceTile.pop
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

    forEachSetOfStarts = (
        board: Board,
        player: Player,
        sideEffect: (orig: Hex, dests: List<Hex>) => void
    ): void => {
        board.explicitTiles.forEach((sourceTile: Tile, source: Hex) => {
            if (sourceTile.owner === player && sourceTile.pop > 1) {
                const dests = source.neighbors.filter((dest: Hex) => {
                        if (!board.canBeOccupied(dest)) return false
                        if (this.settings.wasteNot) { // don't queue a move you'll regret
                            const destTile = board.getTile(dest)
                            if (!canMoveInto(sourceTile, destTile))
                                return false
                        }
                        return true;
                    }
                ) as List<Hex>
                if (dests.size > 0)
                    sideEffect(source, dests)
            }
        })
    }
}

// can capture or merge
const canMoveInto = (sourceTile: Tile, destTile: Tile): boolean =>
    destTile.owner === sourceTile.owner
    || sourceTile.pop + 2 >= destTile.pop