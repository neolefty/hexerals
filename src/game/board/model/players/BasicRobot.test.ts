import {BoardReducerTester} from '../../view/BoardReducerTester';
import {BasicRobot} from './BasicRobot';
import {Player} from './Players';
import {List} from 'immutable';
import {RandomTerrainArranger} from '../RandomTerrainArranger';
import {SpreadPlayersArranger} from '../PlayerArranger';
import {Hex} from '../Hex';
import {Tile} from '../Tile';
import {Terrain} from '../Terrain';

it('makes moves', () => {
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

it('specifies IQ', () => {
    expect(BasicRobot.byIntelligence(BasicRobot.MAX_IQ).skills)
        .toEqual(BasicRobot.byIntelligence(BasicRobot.MAX_IQ).skills)

    for (let i = 0; i < 10; ++i)
        for (let iq = 0; iq <= BasicRobot.MAX_IQ; ++iq)
            expect(BasicRobot.byIntelligence(iq).intelligence).toEqual(iq)
})

it('captures nearby', () => {
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

it('wastes not', () => {
    for (let i = 0; i < 20; ++i) {
        const brt = new BoardReducerTester(3, 2)
        brt.setRobot(Player.Zero, BasicRobot.bySkill(1))
        for (let turn = 0; turn < 20; ++turn) {
            brt.queueRobots()
            brt.doMoves()
        }
        expect(brt.explicitTiles.size === 5)
        // Zero never attacked One because it would lose
        expect(brt.getTile(brt.ur).pop === 20)
    }
})

it('stops by cities', () => {
    const brt = new BoardReducerTester(3, 5)
    brt.setRobot(Player.Zero, BasicRobot.bySkill(BasicRobot.SKILL_STOP_BY_CITIES))
    brt.setTile(Hex.RIGHT_UP.plus(Hex.UP), Tile.CITY)
    brt.setCursor(Hex.ORIGIN)
    // straight up to the top of the board
    brt.queueMove(Player.Zero, Hex.UP)
    brt.queueMove(Player.Zero, Hex.UP)
    brt.queueMove(Player.Zero, Hex.UP)
    brt.queueMove(Player.Zero, Hex.UP)
    brt.queueRobots() // should have no effect — robot is happy with plan
    console.log(`---$--- ${brt.moves.playerQueues.get(Player.Zero).size}`)
    expect(brt.moves.playerQueues.get(Player.Zero).size === 4)
    brt.doMoves()
    brt.queueRobots() // robot should notice city and stop
    console.log(`---$--- ${brt.moves.playerQueues.get(Player.Zero).size}`)
    expect(brt.moves.playerQueues.get(Player.Zero).size === 0)
})

const doesABeatB = (
    first: BasicRobot, second: BasicRobot, turnLimit: number
): boolean => {
    const brt = new BoardReducerTester(13, 7, [
        new RandomTerrainArranger(0.3),
        new SpreadPlayersArranger(),
    ])
    brt.setRobot(Player.Zero, first)  // a clear prejudice in favor of player zero
    brt.setRobot(Player.One, second)
    while (brt.state.turn < turnLimit) {
        brt.queueRobots()
        brt.doMoves()
        brt.stepPop()
        // every 10 turns check for a winner
        if (brt.state.turn % 10 == 0 && brt.isGameOver)
            break
    }
    // noinspection UnnecessaryLocalVariableJS
    const zeroWins = brt.popTotal(Player.Zero) > brt.popTotal(Player.One)
    // console.log(`${brt.state.turn} turns — ${zeroWins ? 'Zero' : 'One'} wins — ${brt.popTotal(Player.Zero)} to ${brt.popTotal(Player.One)} — game over? ${brt.isGameOver}`)
    return zeroWins
}

const robotTrials = 40
const iq0 = BasicRobot.byIntelligence(0)

const countAWins = (
    first: BasicRobot, second: BasicRobot,
    trials: number = robotTrials, turnLimit: number = 250,
): number => {
    let aWins = 0
    for (let i = 0; i < trials; ++i)
        if (doesABeatB(first, second, turnLimit))
            ++aWins
    return aWins
}

it('control — IQ 0 vs self', () => {
    const robot = BasicRobot.byIntelligence(0)
    const control = countAWins(robot, robot)
    console.log(`Dumb vs dumb: ${control}/${robotTrials} = ${control/robotTrials}`)
    expect(control).toBeGreaterThanOrEqual(robotTrials * 0.35)
})

it('IQ 1 not lose too much', () => {
    const skills = List(Array(BasicRobot.MAX_IQ).keys())

    skills.forEach(brainIndex => {
        const smart = BasicRobot.bySkill(brainIndex)
        const wins = countAWins(smart, iq0)
        console.log(`Skill #${brainIndex}: ${wins}/${robotTrials} = ${wins/robotTrials} (${smart.toString()})`)
        expect(wins).toBeGreaterThanOrEqual(robotTrials * 0.4)  // weak!
    })
})

it('max IQ wins a lot', () => {
    const smart = BasicRobot.byIntelligence(BasicRobot.MAX_IQ)
    const wins = countAWins(smart, iq0)
    console.log(`Max IQ: ${wins}/${robotTrials} = ${wins/robotTrials} (${smart.toString()})`)
    expect(wins).toBeGreaterThanOrEqual(robotTrials * 0.60)
})