import {BoardReducerTester} from '../../view/BoardReducerTester';
import {BasicRobot, BasicRobotSettings} from './BasicRobot';
import {Player} from './Players';
import {List} from 'immutable';
import {RandomTerrainArranger} from '../RandomTerrainArranger';
import {SpreadPlayersArranger} from '../PlayerArranger';
import {Hex} from '../Hex';
import {Tile} from '../Tile';
import {Terrain} from '../Terrain';
import {PlayerMove} from '../Move';

it('makes moves', () => {
    const brt = new BoardReducerTester(10, 10)
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

it('captures nearby', () => {
    const smart = new BasicRobot(new BasicRobotSettings(
        false, false, true))
    for (let i = 0; i < 10; ++i) {
        const brt = new BoardReducerTester(3, 2)
        brt.setRobot(Player.Zero, smart)
        brt.placeCursor(brt.ur)
        brt.queueMove(Player.One, Hex.DOWN)
        brt.placeCursor(brt.ll)
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

// TODO specific tests for doesn't waste & stops partway

const makeOneSmart = (index: number): BasicRobot => {
    let bools = Array(BasicRobotSettings.MAX_INTELLIGENCE).fill(false)
    bools[index] = true
    return BasicRobot.byArray(bools)
}

const firstWinOnce = (
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

const robotTrials = 100
const iq0 = BasicRobot.byIntelligence(0)

const firstWins = (
    first: BasicRobot, second: BasicRobot,
    trials: number = robotTrials, turnLimit: number = 250,
): number => {
    let firstWinCount = 0
    for (let i = 0; i < trials; ++i)
        if (firstWinOnce(first, second, turnLimit))
            ++firstWinCount
    return firstWinCount
}

it('control — IQ 0 vs self', () => {
    const robot = BasicRobot.byIntelligence(0)
    const control = firstWins(robot, robot)
    console.log(`Dumb vs dumb: ${control}/${robotTrials}`)
    expect(control).toBeGreaterThanOrEqual(robotTrials * 0.4)
})

it('IQ 1 not lose too much', () => {
    const brains = List(Array(BasicRobotSettings.MAX_INTELLIGENCE).keys())

    brains.forEach(brainIndex => {
        const smart = makeOneSmart(brainIndex)
        const wins = firstWins(smart, iq0)
        console.log(`Intelligence factor #${brainIndex}: ${wins}/${robotTrials} (${smart.toString()})`)
        expect(wins).toBeGreaterThanOrEqual(robotTrials * 0.4)  // weak!
    })
})

it('max IQ wins a lot', () => {
    const smart = BasicRobot.byIntelligence(3)
    const wins = firstWins(smart, iq0)
    console.log(`Max IQ: ${wins}/${robotTrials} (${smart.toString()})`)
    expect(wins).toBeGreaterThanOrEqual(robotTrials * 0.6)
})