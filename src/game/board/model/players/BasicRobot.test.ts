import {BoardReducerTester} from '../../view/BoardReducerTester';
import {BasicRobot} from './BasicRobot';
import {pickNPlayers, Player} from './Players';
import {List} from 'immutable';
import {RandomTerrainArranger} from '../RandomTerrainArranger';
import {SpreadPlayersArranger} from '../SpreadPlayerArranger';
import {Hex} from '../Hex';
import {Tile} from '../Tile';
import {Terrain} from '../Terrain';
import {Robot} from './Robot';

const logWinLoss = false

xit('makes moves', () => {
    const brt = new BoardReducerTester(10, 10)
    const stupid = BasicRobot.byIntelligence(0)
    brt.setRobot(Player.Zero, stupid)
    brt.setRobot(Player.One, stupid)
    const countNonEmptyHexes = () =>
        brt.board.filterTiles(tile => tile.pop > 0).size
    // two explicitTiles should have non-zero population
    expect(countNonEmptyHexes()).toEqual(2)
    brt.queueRobots()
    brt.doMoves()
    // after each robot moves once, they should each own 2 hexes -- 4 total
    expect(countNonEmptyHexes()).toEqual(4)
})

xit('specifies IQ', () => {
    expect(BasicRobot.byIntelligence(BasicRobot.MAX_IQ).skills)
        .toEqual(BasicRobot.byIntelligence(BasicRobot.MAX_IQ).skills)

    for (let i = 0; i < 10; ++i)
        for (let iq = 0; iq <= BasicRobot.MAX_IQ; ++iq)
            expect(BasicRobot.byIntelligence(iq).intelligence).toEqual(iq)
})

xit('captures nearby', () => {
    for (let i = 0; i < 10; ++i) {
        const brt = new BoardReducerTester(3, 2)
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
    }
})

xit('wastes not', () => {
    for (let i = 0; i < 20; ++i) {
        const brt = new BoardReducerTester(3, 2)
        brt.setRobot(Player.Zero, BasicRobot.bySkill(
            BasicRobot.SKILL_WASTE_NOT))
        for (let turn = 0; turn < 20; ++turn) {
            brt.queueRobots()
            brt.doMoves()
        }
        expect(brt.explicitTiles.size === 5)
        // Zero never attacked One because it would lose
        expect(brt.getTile(brt.ur).pop === 20)
    }

    const brt = new BoardReducerTester(1, 4)
    brt.setRobot(Player.Zero, BasicRobot.bySkill(
        BasicRobot.SKILL_WASTE_NOT))
    expect(brt.ur === Hex.getCart(0, 6)).toBeTruthy()
    expect(brt.getTile(brt.ur).pop).toBe(50)
    brt.queueRobots()
    // expect robot plans to move straight up to end
    expect(brt.moves.playerQueues.get(Player.Zero).size).toBe(3)
    brt.doMoves()
    brt.doMoves()
    expect(brt.moves.playerQueues.get(Player.Zero).size).toBe(1)
    expect(brt.moves.playerQueues.get(Player.Zero)
        .get(0).delta === Hex.UP).toBeTruthy()
    brt.queueRobots()
    // robot should cancel doomed move and change directions
    expect(brt.moves.playerQueues.get(Player.Zero)
        .get(0).delta === Hex.DOWN).toBeTruthy()
})

xit('wastes not, even on a small board', () => {
    const brt = new BoardReducerTester(1, 2)
    brt.setRobot(Player.Zero, BasicRobot.bySkill(
        BasicRobot.SKILL_WASTE_NOT))
    brt.queueRobots()
    // didn't queue because the only possible move would be a losing battle
    expect(brt.moves.playerQueues.get(Player.Zero)).toBeUndefined()
})

xit('stops by cities', () => {
    const n = 5
    for (let i = 0; i < n; ++i) {
        const brt = new BoardReducerTester(3, 5)
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
        expect(brt.moves.playerQueues.get(Player.Zero).size === 4)
        brt.doMoves()
        brt.queueRobots() // robot should notice city and plan to capture it
        expect(brt.moves.playerQueues.get(Player.Zero).size).toBe(1)
        expect(brt.moves.playerQueues.get(Player.Zero)
            .get(0).delta === Hex.RIGHT_UP).toBeTruthy()
    }
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
        13, 7, [
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
        brt.stepPop()
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
    for (let i = 0; i < trials; ++i)
        if (doesABeatB(first, second, turnLimit))
            ++aWins
    return aWins
}

xit('control — IQ 0 vs self', () => {
    const control = countAWins(iq0, iq0)
    if (logWinLoss)
        // tslint:disable-next-line
        console.log(`Dumb vs dumb: ${control}/${robotTrials} = ${control/robotTrials}`)
    expect(control).toBeGreaterThanOrEqual(robotTrials * (logWinLoss ? 0.35 : 0.3))
})

xit('IQ 1 not lose too much', () => {
    const skills = List(Array(BasicRobot.MAX_IQ).keys())

    skills.forEach(skillIndex => {
        const smart = SkillRobotMaker(skillIndex)
        const wins = countAWins(smart, iq0)
        if (logWinLoss)
            // tslint:disable-next-line
            console.log(`Skill #${skillIndex}: ${wins}/${robotTrials} = ${wins/robotTrials} (${smart().toString()})`)
        expect(wins).toBeGreaterThanOrEqual(robotTrials * (logWinLoss ? 0.4 : 0.35))  // weak!
    })
})

xit('max IQ wins a lot', () => {
    const n = robotTrials * 2
    const wins = countAWins(iqMax, iq0, n)
    if (logWinLoss)
        // tslint:disable-next-line
        console.log(`Max IQ: ${wins}/${n} = ${wins/n} (${iqMax().toString()})`)
    expect(wins).toBeGreaterThanOrEqual(n * (logWinLoss ? 0.6 : 0.55)) // ugh, low
})