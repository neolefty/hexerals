import {BoardReducerTester} from '../board/BoardReducerTester'
import {BasicRobot} from './BasicRobot'
import {pickNPlayers, Player} from './Players'
import {List, Range} from 'immutable'
import {RandomTerrainArranger} from '../setup/RandomTerrainArranger'
import {SpreadPlayersArranger} from '../setup/SpreadPlayerArranger'
import {Hex} from '../hex/Hex'
import {Tile} from '../hex/Tile'
import {Terrain} from '../hex/Terrain'
import {Robot} from './Robot'
import {PlayerMove} from '../move/Move'

const logWinLoss = false

it('makes moves', () => {
    const brt = new BoardReducerTester(10, 19)
    const stupid = BasicRobot.byIntelligence(0)
    brt.setRobot(Player.Zero, stupid)
    brt.setRobot(Player.One, stupid)
    const countNonEmptyHexes = () =>
        brt.board.filterTiles(tile => tile.pop > 0).size
    // two tiles should have non-zero population
    expect(countNonEmptyHexes()).toEqual(2)
    brt.queueRobots()
    brt.doMoves()
    // after each robot moves once, they should each own 2 hexes -- 4 total
    expect(countNonEmptyHexes()).toEqual(4)
})

it('specifies IQ', () => {
    expect(BasicRobot.byIntelligence(BasicRobot.MAX_IQ).skills)
        .toEqual(BasicRobot.byIntelligence(BasicRobot.MAX_IQ).skills)

    Range(0, 10).forEach(() =>
        Range(0, BasicRobot.MAX_IQ + 1).forEach(iq =>
            expect(BasicRobot.byIntelligence(iq).intelligence).toEqual(iq)
        )
    )
})

it('captures nearby', () => {
    Range(0, 10).forEach(() => {
        const brt = new BoardReducerTester(3, 3)
        brt.setRobot(Player.Zero, BasicRobot.bySkill(2))
        brt.setCursor(brt.ur)
        brt.queueMove(Player.One, Hex.DOWN)
        brt.setCursor(brt.ll)
        brt.queueMove(Player.Zero, Hex.RIGHT_UP)
        brt.doMoves()
        expect(brt.getTile(Hex.RIGHT_UP)).toEqual(new Tile(Player.Zero, 49))
        expect(brt.getTile(brt.ur)).toEqual(
            new Tile(Player.One, 1, Terrain.City))
        brt.queueRobots()
        brt.doMoves()
        expect(brt.getTile(brt.ur)).toEqual(
            new Tile(Player.Zero, 47, Terrain.City))
    })
})

it('wastes not', () => {
    Range(0, 20).forEach(() => {
        const brt = new BoardReducerTester(3, 3)
        expect(brt.board.hexesAll.size).toBe(5)
        brt.setRobot(Player.Zero, BasicRobot.bySkill(
            BasicRobot.SKILL_WASTE_NOT))
        for (let turn = 0; turn < 20; ++turn) {
            brt.queueRobots()
            brt.doMoves()
        }
        expect(brt.explicitTiles.size === 5)
        // Zero never attacked One because it would lose
        expect(brt.getTile(brt.ur).pop === 20)
    })

    const brt = new BoardReducerTester(1, 7)
    brt.setRobot(Player.Zero, BasicRobot.bySkill(
        BasicRobot.SKILL_WASTE_NOT))
    expect(brt.ur === Hex.getCart(0, 6)).toBeTruthy()
    expect(brt.getTile(brt.ur).pop).toBe(50)
    brt.queueRobots()
    // expect robot plans to move straight up to end
    const up3 = brt.moves.playerQueues.get(Player.Zero) as List<PlayerMove>
    expect(up3.size).toBe(3)
    brt.doMoves()
    brt.doMoves()
    const up1 = brt.moves.playerQueues.get(Player.Zero) as List<PlayerMove>
    expect(up1.size).toBe(1)
    const upMove = up1.first() as PlayerMove
    expect(upMove.delta === Hex.UP).toBeTruthy()
    brt.queueRobots()
    // robot should cancel doomed move and change directions
    const downMoves = brt.moves.playerQueues.get(Player.Zero) as List<PlayerMove>
    const downMove = downMoves.first() as PlayerMove
    expect(downMove.delta === Hex.DOWN).toBeTruthy()
})

it('wastes not, even on a small board', () => {
    const brt = new BoardReducerTester(1, 3)
    brt.setRobot(Player.Zero, BasicRobot.bySkill(
        BasicRobot.SKILL_WASTE_NOT))
    brt.queueRobots()
    // didn't queue because the only possible move would be a losing battle
    expect(brt.moves.playerQueues.get(Player.Zero)).toBeUndefined()
})

it('stops by cities', () => {
    const n = 5
    Range(0, n).forEach(() => {
        const brt = new BoardReducerTester(3, 9)
        let skills: boolean[] = Array(BasicRobot.MAX_IQ).fill(false)
        skills[BasicRobot.SKILL_CAPTURE_NEARBY] = true
        skills[BasicRobot.SKILL_STOP_BY_CITIES] = true
        brt.setRobot(Player.Zero, new BasicRobot(skills))
        brt.setTile(Hex.RIGHT_UP.plus(Hex.UP), Tile.CITY)
        brt.setCursor(Hex.ORIGIN)
        // straight up to the top of the board
        brt.queueMove(Player.Zero, Hex.UP)
        brt.queueMove(Player.Zero, Hex.UP)
        brt.queueMove(Player.Zero, Hex.UP)
        brt.queueMove(Player.Zero, Hex.UP)
        brt.queueRobots() // should have no effect — robot is happy with plan
        const beforeCity = brt.moves.playerQueues.get(Player.Zero) as List<PlayerMove>
        expect(beforeCity.size === 4)
        brt.doMoves()
        brt.queueRobots() // robot should notice city and plan to capture it
        const noticeCity = brt.moves.playerQueues.get(Player.Zero) as List<PlayerMove>
        expect(noticeCity.size).toBe(1)
        const captureCity = noticeCity.first() as PlayerMove
        expect(captureCity.delta === Hex.RIGHT_UP).toBeTruthy()
    })
})

type RobotMaker = () => Robot
const robotTrials = logWinLoss ? 40 : 16
const IQRobotMaker = (iq: number) => () =>
    BasicRobot.byIntelligence(iq)
const SkillRobotMaker = (skill: number) => () =>
    BasicRobot.bySkill(skill)
const iq0 = IQRobotMaker(0)
const iqMax = IQRobotMaker(BasicRobot.MAX_IQ)

const doesABeatB = (
    first: RobotMaker, second: RobotMaker, turnLimit: number
): boolean => {
    const brt = new BoardReducerTester(
        13, 13, [
            new RandomTerrainArranger(0.3),
            new SpreadPlayersArranger(),
        ], pickNPlayers(4)
    )
    brt.setRobot(Player.Zero, first())
    brt.setRobot(Player.One, second())
    brt.setRobot(Player.Two, first())
    brt.setRobot(Player.Three, second())
    while (brt.state.turn < turnLimit) {
        brt.queueRobots()
        brt.doMoves()
        brt.gameTick()
        // every 10 turns check for a winner
        if (brt.state.turn % 10 == 0 && brt.isGameOver)
            break
    }
    // noinspection UnnecessaryLocalVariableJS
    const firstWins
        = brt.popTotal(Player.Zero) + brt.popTotal(Player.Two)
        > brt.popTotal(Player.One) + brt.popTotal(Player.Three)
    return firstWins
}

const countAWins = (
    first: RobotMaker, second: RobotMaker,
    trials: number = robotTrials, turnLimit: number = 250,
): number => {
    let aWins = 0
    Range(0, trials).forEach(() => {
        if (doesABeatB(first, second, turnLimit))
            ++aWins
    })
    return aWins
}

it('control — IQ 0 vs self', () => {
    const control = countAWins(iq0, iq0)
    if (logWinLoss)
        // tslint:disable-next-line
        console.log(`Dumb vs dumb: ${control}/${robotTrials} = ${control/robotTrials}`)
    expect(control).toBeGreaterThanOrEqual(robotTrials * (logWinLoss ? 0.35 : 0.3))
})

it('IQ 1 not lose too much', () => {
    Range(0, BasicRobot.MAX_IQ).forEach(skillIndex => {
        const smart = SkillRobotMaker(skillIndex)
        const wins = countAWins(smart, iq0)
        if (logWinLoss)
            // tslint:disable-next-line
            console.log(`Skill #${skillIndex}: ${wins}/${robotTrials} = ${wins/robotTrials} (${smart().toString()})`)
        expect(wins).toBeGreaterThanOrEqual(robotTrials * (logWinLoss ? 0.4 : 0.35))  // weak!
    })
})

it('max IQ wins a lot', () => {
    const n = robotTrials * 2
    const wins = countAWins(iqMax, iq0, n)
    if (logWinLoss)
        // tslint:disable-next-line
        console.log(`Max IQ: ${wins}/${n} = ${wins/n} (${iqMax().toString()})`)
    expect(wins).toBeGreaterThanOrEqual(n * (logWinLoss ? 0.6 : 0.55)) // ugh, low
})