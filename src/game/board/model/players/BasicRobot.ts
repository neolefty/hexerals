import {List} from 'immutable';

import {GameDecision, Robot} from './Robot';
import {HexMove, PlayerMove} from '../Move';
import {BoardState} from '../BoardState';
import {Player} from './Players';
import {Hex} from '../Hex';
import {Tile} from '../Tile';
import {Board} from '../Board';
import {Comma} from '../../../../common/Comma';
import * as assert from 'assert';

// improvements
// * defend capital
// * consolidate pop
// * move towards opponents
// * capture opponent hexes (not just cities)

const NONE_MOVE = new HexMove(Hex.NONE, Hex.NONE)

export class BasicRobot implements Robot {
    static readonly MAX_IQ = 4

    // doesn't always move all the way until blocked
    static readonly SKILL_STOP_PARTWAY = 0
    // avoids making losing moves
    static readonly SKILL_WASTE_NOT = 1
    // grabs cities if it can
    static readonly SKILL_CAPTURE_NEARBY = 2
    // stops if it's next to an opposing city
    static readonly SKILL_STOP_BY_CITIES = 3
/*
    // captures enemy tiles
    static readonly SKILL_LIKES_CAPTURE = 4
    // prioritizes economical captures
    static readonly SKILL_SAVES_POP = 5
*/

    static readonly SKILL_NAMES = [
        'stops partway', 'wastes not', 'captures nearby', 'stops by cities',
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
        return this.skills[BasicRobot.SKILL_CAPTURE_NEARBY] }
    get stopsByCities(): boolean {
        return this.skills[BasicRobot.SKILL_STOP_BY_CITIES] }
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
                result.makeMoves = moves
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