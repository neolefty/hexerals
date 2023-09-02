import { List } from "immutable"
import { devAssert } from "../../../common/Environment"
import { shuffle } from "../../../common/Shuffle"
import { Board } from "../board/Board"
import { BoardState } from "../board/BoardState"
import { Hex } from "../hex/Hex"
import { growsFast, Terrain } from "../hex/Terrain"
import { Tile } from "../hex/Tile"
import { HexMove, PlayerMove } from "../move/Move"
import { Player } from "./Players"
import { GameDecision, Robot } from "./Robot"

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

const SKILLS_SMARTEST = {
    // Doesn't move all the way until blocked
    stopPartway: true,
    // Avoids making losing attacks
    wasteNot: true,
    // Captures cities if possible
    captureCity: true,
    // Stops if it's next to an opposing city
    stopByCities: true,
    // Tends to concentrate pop
    consolidate: true,
    // Leaves pop in capitals to protect them
    garrison: true,
    // TODO: actively defend capital by attacking armies next to it, either from nearby or from capital
    activeDefense: true,

    // tends to take empty squares
    // captureEmpty: true,
    // tends to take opponents' tiles
    // captureTile: true,
    // prioritizes economical captures
    // savePop: true,
}

type RobotSkills = Record<keyof typeof SKILLS_SMARTEST, boolean> // typeof SKILLS_SMARTEST
const MAX_IQ = Object.keys(SKILLS_SMARTEST).length

const skillsFromBooleans = (skills: ReadonlyArray<boolean>): RobotSkills => {
    devAssert(skills.length === BasicRobot.MAX_IQ, `${skills}`)
    const result: RobotSkills = { ...SKILLS_SMARTEST }
    // we know that result has no extra keys, so this cast is safe
    const keys = Object.keys(result) as Array<keyof RobotSkills>
    keys.forEach((key, i) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        result[key] = skills[i]!
    })
    return result
}

// This turned out to not really work — maybe in a future version of TypeScript, sigh
// type RobotSkillsBooleans = FixedLengthArray<boolean, typeof MAX_IQ>

export class BasicRobot implements Robot {
    // garrison bias (0 means never move, 1 means always) towards leaving pop in capital
    static readonly GARRISON_FACTOR = 0.3
    static MAX_IQ = MAX_IQ

    // assign N random skills
    static byIntelligence(intelligence: number): BasicRobot {
        devAssert(intelligence <= BasicRobot.MAX_IQ, `${intelligence}`)
        const settings: boolean[] = Array(BasicRobot.MAX_IQ).fill(false)
        while (settings.filter((value) => value).length < intelligence)
            settings[Math.floor(Math.random() * this.MAX_IQ)] = true
        return new BasicRobot(skillsFromBooleans(settings))
    }

    /** A robot with a single skill. */
    static bySkill(skill: number): BasicRobot {
        const skills = Array(BasicRobot.MAX_IQ).fill(false)
        skills[skill] = true
        return new BasicRobot(skillsFromBooleans(skills))
    }

    constructor(readonly skills: RobotSkills) {}

    get intelligence() {
        return Object.values(this.skills).reduce(
            (sum, skill) => sum + (skill ? 1 : 0),
            0
        )
    }

    get isWatchingNextMove() {
        return this.skills.stopByCities || this.skills.wasteNot
    }

    maxConsolidations(bs: BoardState, player: Player): number {
        return Math.min(
            4, // at least 4
            Math.max(
                // and at most ...
                bs.board.constraints.opts.roundTicks / 4, // quarter the number of ticks between blank increases
                Math.min(bs.board.edges.width, bs.board.edges.height) / 2 // or half the shortest dimension
            )
        )
    }

    decide(
        player: Player,
        bs: BoardState,
        curMoves?: List<PlayerMove>
    ): GameDecision | undefined {
        const result: GameDecision = {}

        // queue moves? If there aren't any queued currently ...
        let shouldQueue: boolean = !curMoves || curMoves.size === 0
        let respondingToThreat = false

        // protect the capital
        if (this.skills.activeDefense) {
            // 1. find the worst threat to a capital
            let threatHex = Hex.NONE
            let threatTile = Tile.EMPTY
            bs.board.capitals
                .filter((tile) => tile.owner === player)
                .forEach((tile, hex) => {
                    bs.board.forNeighborsOccupiable(
                        hex,
                        (neighborHex, neighborTile) => {
                            if (
                                neighborTile.owner !== player &&
                                neighborTile.pop > threatTile.pop
                            ) {
                                threatHex = neighborHex
                                threatTile = neighborTile
                            }
                        }
                    )
                })
            if (threatHex !== Hex.NONE) {
                // 2. attack that spot
                const defenseMoves = this.attackFromNeighbors(
                    bs.board,
                    threatHex,
                    player
                )
                if (defenseMoves.size > 0) {
                    respondingToThreat = true
                    if (curMoves) result.cancelMoves = curMoves.size
                    result.makeMoves = defenseMoves
                    shouldQueue = false
                }
            }
        }

        // TODO stop going back into the same city over and over (pattern is queue a move out of a city, it only makes it one hex away and is stopped by something, and then goes back, to reinforce the city
        // cancel moves?
        if (
            !respondingToThreat &&
            this.isWatchingNextMove &&
            curMoves &&
            curMoves.size > 0
        ) {
            const nextMove = curMoves.get(0) as PlayerMove
            const source = bs.board.getTile(nextMove.source)
            const dest = bs.board.getTile(nextMove.dest)
            let cancel = false

            // avoid losing battles?
            if (this.skills.wasteNot && !canMoveInto(source, dest))
                cancel = true

            // stop if we're next to an opponent's city?
            if (this.skills.stopByCities) {
                bs.board.forNeighborsOccupiable(
                    nextMove.source,
                    (neighborHex, neighborTile) => {
                        cancel =
                            cancel ||
                            (neighborTile.growsFast &&
                                neighborTile.owner !== player)
                    }
                )
            }

            if (cancel) {
                result.cancelMoves = curMoves.size
                shouldQueue = true
            }
        }

        // capture a nearby city, if we're stopped anyway
        if (shouldQueue && this.skills.captureCity) {
            bs.board
                .filterTiles((tile) => tile.owner === player)
                .forEach((myHex) => {
                    const myTile = bs.board.getTile(myHex)
                    bs.board.forNeighborsOccupiable(
                        myHex,
                        (neighborHex, neighborTile) => {
                            if (
                                neighborTile.owner !== player &&
                                neighborTile.growsFast &&
                                neighborTile.pop <= myTile.pop - 1
                            ) {
                                result.makeMoves = append(
                                    result.makeMoves,
                                    List([
                                        new HexMove(
                                            myHex,
                                            neighborHex.minus(myHex)
                                        ),
                                    ])
                                )
                                shouldQueue = false
                            }
                        }
                    )
                })
        }

        if (shouldQueue && this.skills.consolidate) {
            // pairs of [ pop, move ] — ignore smaller moves
            let smallSize = 2 // can't move if pop is 1
            let moves = List<[number, HexMove]>().withMutations((moves) => {
                bs.board
                    .filterOwnedTiles(
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        ([hex, tile]) => tile.owner === player && tile.pop > 1
                    )
                    .forEach(([bigHex, bigTile]) => {
                        bs.board.forNeighborsOccupiable(
                            bigHex,
                            (smallHex, smallTile) => {
                                // value protecting cities
                                const moveValue =
                                    smallTile.pop *
                                    (growsFast(bigTile.terrain) ? 2 : 1)
                                if (
                                    // only move if it's a "big move"
                                    moveValue >= smallSize &&
                                    // and either protect cities or consolidate onto larger tiles
                                    (growsFast(bigTile.terrain) ||
                                        bigTile.pop >= smallTile.pop)
                                ) {
                                    if (smallTile.pop > smallSize * 1.5) {
                                        // if we've found a move that's much bigger than the rest
                                        // console.log(`small size ${smallSize} ——> ${smallTile.pop}`)
                                        smallSize = smallTile.pop
                                    }
                                    moves.push([
                                        moveValue,
                                        new HexMove(
                                            smallHex,
                                            bigHex.minus(smallHex)
                                        ),
                                    ])
                                }
                            }
                        )
                    })
            })

            moves = shuffle(moves)
            moves = moves.sort(([a /*, am*/], [b /*, bm*/]) => b - a)
            const n = this.maxConsolidations(bs, player)
            if (moves.size > n) moves = moves.slice(0, n)
            result.makeMoves = append(
                result.makeMoves,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                moves.map(([_, move]) => move)
            )
            // note: leave shouldQueue = true — go ahead and queue in a random direction, too
        }

        // queue moves in a random direction if appropriate
        if (shouldQueue) {
            let totalPop = 0
            let chosenMove: HexMove = NONE_MOVE
            this.forEachSetOfStarts(
                bs.board,
                player,
                (source: Hex, dests: ReadonlyArray<Hex>) => {
                    const sourceTile = bs.board.getTile(source)
                    let weightedSourcePop = sourceTile.pop
                    if (
                        sourceTile.terrain === Terrain.Capital &&
                        this.skills.garrison
                    )
                        weightedSourcePop *= BasicRobot.GARRISON_FACTOR
                    // I think this is a shortcut to giving each move a fair weight
                    const takeIt: boolean =
                        Math.random() * (totalPop + weightedSourcePop) >
                        totalPop
                    if (takeIt) {
                        const dest =
                            dests[Math.floor(Math.random() * dests.length)]!
                        chosenMove = new HexMove(source, dest.minus(source))
                    }
                    totalPop += weightedSourcePop
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
                if (moves.size > 1 && this.skills.stopPartway) {
                    const movesToDrop = Math.floor(
                        Math.random() * Math.random() * moves.size
                    )
                    moves = moves.slice(
                        0,
                        moves.size - movesToDrop
                    ) as List<HexMove>
                    devAssert(moves.size >= 1)
                }
                result.makeMoves = append(result.makeMoves, moves)
            }
        }

        return result
    }

    // have player attack a target from its neighbors, minimizing effort & risk
    attackFromNeighbors = (
        board: Board,
        target: Hex,
        player: Player
    ): List<HexMove> => {
        let notCapMoves = List<HexMove>() // attacks from non-capitals
        let capMoves = List<HexMove>() // attacks from capitals
        // find all hexes that player can use to attack the target
        board.forNeighborsOccupiable(target, (neighborHex, neighborTile) => {
            if (neighborTile.owner === player && neighborTile.pop > 1) {
                const move = HexMove.constructDest(neighborHex, target)
                if (neighborTile.terrain === Terrain.Capital)
                    capMoves = capMoves.push(move)
                else notCapMoves = notCapMoves.push(move)
            }
        })
        // sorted from largest to smallest non-capitals ...
        notCapMoves = notCapMoves.sort(
            (a, b) => board.getTile(a.source).pop - board.getTile(b.source).pop
        )
        // ... and then capitals (to try to avoid moving them)
        const allMoves: List<HexMove> = notCapMoves.concat(capMoves)

        // how many of those moves does it take to capture?
        let remainPop = board.getTile(target).pop
        let i = 0
        while (remainPop > -1 && i < allMoves.size) {
            // attack until defeated
            remainPop -=
                board.getTile(allMoves.get(i, HexMove.NO_MOVE).source).pop - 1
            ++i
        }
        return allMoves.slice(0, i)
    }

    forEachSetOfStarts = (
        board: Board,
        player: Player,
        sideEffect: (orig: Hex, dests: ReadonlyArray<Hex>) => void
    ): void => {
        board.explicitTiles.forEach((sourceTile: Tile, source: Hex) => {
            if (sourceTile.owner === player && sourceTile.pop > 1) {
                const dests = source.neighbors.filter((dest: Hex) => {
                    if (!board.canBeOccupied(dest)) return false
                    if (this.skills.wasteNot) {
                        // don't queue a move you'll regret
                        const destTile = board.getTile(dest)
                        if (!canMoveInto(sourceTile, destTile)) return false
                    }
                    return true
                })
                if (dests.length > 0) sideEffect(source, dests)
            }
        })
    }

    toString() {
        let result = `IQ ${this.intelligence}`
        const skillDescription = Object.entries(this.skills)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .filter(([name, value]) => value)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .map(([name, value]) => value)
            .join(", ")
        if (skillDescription) result += ` — ${skillDescription}`
        return result
    }
}

// can capture or merge
const canMoveInto = (sourceTile: Tile, destTile: Tile): boolean =>
    destTile.owner === sourceTile.owner || sourceTile.pop - 2 >= destTile.pop
