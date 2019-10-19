import * as assert from 'assert'
import {List} from 'immutable'
import {Comma} from '../../../common/Comma'
import {shuffle} from "../../../common/Shuffle"
import {Board} from '../board/Board'
import {BoardState} from '../board/BoardState'
import {Hex} from '../hex/Hex'
import {growsFast} from "../hex/Terrain"
import {Tile} from '../hex/Tile'
import {HexMove, PlayerMove} from '../move/Move'
import {Player} from './Players'
import {GameDecision, Robot} from './Robot'

// improvements
// * defend capital
// * consolidate pop
// * move towards opponents
// * capture opponent hexes (not just cities)

const NONE_MOVE = new HexMove(Hex.NONE, Hex.NONE)

const append = <T>(a?: List<T>, b?: List<T>): List<T> | undefined => {
    if (a) {
        if (b) return a.concat(b)
        else return a
    } else {
        if (b) return b
        else return undefined
    }
}

export class BasicRobot implements Robot {
    static readonly MAX_IQ = 5

    // doesn't always move all the way until blocked
    static readonly SKILL_STOP_PARTWAY = 0
    // avoids making losing moves
    static readonly SKILL_WASTE_NOT = 1
    // grabs cities if it can
    static readonly SKILL_CAPTURE_CITY = 2
    // stops if it's next to an opposing city
    static readonly SKILL_STOP_BY_CITIES = 3
    // tends to concentrate pop
    static readonly SKILL_CONSOLIDATE = 4
    // tends to take empty squares
    // static readonly SKILL_SPREAD = 5
    // tends to take opponents' squares
    // static readonly SKILL_CAPTURE = 6
/*
    // captures enemy tiles
    static readonly SKILL_LIKES_CAPTURE = 4
    // prioritizes economical captures
    static readonly SKILL_SAVES_POP = 5
*/

    static readonly SKILL_NAMES = [
        'stops partway', 'wastes not', 'captures nearby', 'stops by cities', 'consolidates',
    ]

    // assign N random skills
    static byIntelligence(intelligence: number): BasicRobot {
        assert.ok(intelligence <= BasicRobot.MAX_IQ, `${intelligence}`)
        let settings: boolean[] = Array(
            BasicRobot.MAX_IQ).fill(false)
        while (settings.filter(value => value).length < intelligence)
            settings[Math.floor(
                Math.random() * this.MAX_IQ
            )] = true
        return new BasicRobot(settings)
    }

    static bySkill(skill: number): BasicRobot {
        let bools = Array(BasicRobot.MAX_IQ).fill(false)
        bools[skill] = true
        return new BasicRobot(bools)
    }

    constructor(readonly skills: boolean[]) {
        assert.strictEqual(skills.length, BasicRobot.MAX_IQ)
    }

    get stopsPartway(): boolean {
        return this.skills[BasicRobot.SKILL_STOP_PARTWAY] }
    get wastesNot(): boolean {
        return this.skills[BasicRobot.SKILL_WASTE_NOT] }
    get capturesNearby(): boolean {
        return this.skills[BasicRobot.SKILL_CAPTURE_CITY] }
    get stopsByCities(): boolean {
        return this.skills[BasicRobot.SKILL_STOP_BY_CITIES] }
    get consolidates(): boolean {
        return this.skills[BasicRobot.SKILL_CONSOLIDATE] }
    // get spreads(): boolean {
    //     return this.skills[BasicRobot.SKILL_SPREAD] }
/*
    get likesCapture(): boolean {
        return this.skills[BasicRobot.SKILL_LIKES_CAPTURE] }
    get savesPop(): boolean {
        return this.skills[BasicRobot.SKILL_SAVES_POP] }
*/

    get intelligence() {
        let result = 0
        this.skills.forEach(skill => result += (skill ? 1 : 0))
        return result
    }

    get isWatchingNextMove() {
        return this.stopsByCities || this.wastesNot
    }

    maxConsolidations(bs: BoardState, player: Player): number {
        return Math.min(4, // at least 4
            Math.max( // and at most ...
                bs.board.constraints.opts.roundTicks / 4, // quarter the number of ticks between blank increases
                Math.min(bs.board.edges.width, bs.board.edges.height) / 2 // or half the shortest dimension
            )
        )
    }

    decide(
        player: Player, bs: BoardState, curMoves?: List<PlayerMove>
    ): GameDecision | undefined {
        let result: GameDecision = {}

        // queue moves? If there aren't any queued currently ...
        let shouldQueue: boolean = !curMoves || curMoves.size === 0

        // TODO abstract these skills
        // TODO fuzzy robot that likes or dislikes moves

        // cancel moves?
        if (this.isWatchingNextMove && curMoves && curMoves.size > 0) {
            const nextMove = curMoves.get(0) as PlayerMove
            const source = bs.board.getTile(nextMove.source)
            const dest = bs.board.getTile(nextMove.dest)
            let cancel = false

            // avoid losing battles?
            if (this.wastesNot && !canMoveInto(source, dest))
                cancel = true

            // stop if we're next to an opponent's city?
            if (this.stopsByCities) {
                bs.board.forNeighborsOccupiable(
                    nextMove.source, (neighborHex, neighborTile) => {
                        cancel = cancel || (
                            neighborTile.growsFast && neighborTile.owner !== player
                        )
                    }
                )
            }

            if (cancel) {
                result.cancelMoves = curMoves.size
                shouldQueue = true
            }
        }

        // capture a nearby city, if we're stopped anyway
        if (shouldQueue && this.capturesNearby) {
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
                            result.makeMoves = append(
                                result.makeMoves,
                                List([
                                    new HexMove(myHex, neighborHex.minus(myHex))
                                ])
                            )
                            shouldQueue = false
                        }
                    }
                )
            })
        }

        if (shouldQueue && this.consolidates) {
            // keep track of what size we're moving
            // TODO keep track of last N largest moves, and ignore anything smaller?
            let smallSize = 2
            let moves = List<HexMove>().withMutations(moves => {
                bs.board.filterOwnedTiles(
                    ([hex, tile]) => tile.owner === player && tile.pop > 1
                ).forEach(([bigHex, bigTile]) => {
                    bs.board.forNeighborsOccupiable(
                        bigHex, (smallHex, smallTile) => {
                            if (
                                // only move if it's a "big move"
                                smallTile.pop >= smallSize
                                // and either protect cities or consolidate onto larger tiles
                                && (growsFast(bigTile.terrain) || bigTile.pop >= smallTile.pop)
                            ) {
                                if (smallTile.pop > smallSize * 1.7) { // if we've found a move that's much bigger than the rest
                                    smallSize = smallTile.pop
                                    moves.clear()
                                }
                                moves.push(new HexMove(smallHex, bigHex.minus(smallHex)))
                            }
                        }
                    )
                })
            })

            moves = shuffle(moves)
            const n = this.maxConsolidations(bs, player)
            if (moves.size > n)
                moves = moves.slice(0, n)
            result.makeMoves = append(result.makeMoves, moves)
            // go ahead and queue in a random direction, too
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
                        const dest = dests.get(Math.floor(Math.random() * dests.size)) as Hex
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
                if (moves.size > 1 && this.stopsPartway) {
                    const movesToDrop = Math.floor(
                        Math.random() * Math.random() * moves.size
                    )
                    moves = moves.slice(0, moves.size - movesToDrop) as List<HexMove>
                    assert.ok(moves.size >= 1)
                }
                result.makeMoves = append(result.makeMoves, moves)
            }
        }

        return result
    }

    forEachSetOfStarts = (
        board: Board,
        player: Player,
        sideEffect: (orig: Hex, dests: List<Hex>) => void
    ): void => {
        board.explicitTiles.forEach((sourceTile: Tile, source: Hex) => {
            if (sourceTile.owner === player && sourceTile.pop > 1) {
                const dests = source.neighbors.filter((dest: Hex) => {
                        if (!board.canBeOccupied(dest)) return false
                        if (this.wastesNot) { // don't queue a move you'll regret
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

    toString() {
        let result = `IQ ${this.intelligence}`
        const comma = new Comma(' — ', ', ')
        this.skills.forEach((v, i) =>
            result += v ? `${comma}${BasicRobot.SKILL_NAMES[i]}` : ''
        )
        return result
    }
}

// can capture or merge
const canMoveInto = (sourceTile: Tile, destTile: Tile): boolean =>
    destTile.owner === sourceTile.owner
    || sourceTile.pop - 2 >= destTile.pop