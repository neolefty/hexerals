import {Map} from 'immutable'

import {CycleReducerTester} from '../cycle/CycleReducerTester'
import {Player} from '../players/Players'
import {Hex} from '../hex/Hex'
import {StatHistory} from './StatHistory'
import {GamePhase} from '../cycle/GamePhase'
import {BoardStat} from '../board/BoardStat'

const EMPTY_BOARD_STAT = new BoardStat<string>(Map(), 0)

it('BoardStat', () => {
    const a = EMPTY_BOARD_STAT.set('foo', 10).set('bar', 20)
    expect(a.total).toBe(30)
    const b = EMPTY_BOARD_STAT.set('foo', 15).set('baz', 5)
    expect(a.max(b).total).toBe(40)
    const c = EMPTY_BOARD_STAT.set('bar', 12).set('baz', 7)
    const all = a.max(b).max(c)
    expect(all.total).toBe(42)
    expect(all.max(a) === all).toBeTruthy()
    expect(all.max(b) === all).toBeTruthy()
})

it('tracks stat history', () => {
    const crt = new CycleReducerTester()
    crt.useCornersArranger()
    crt.openLocalGame(3, 3, 3)

    const stats = () => (crt.localBoard && crt.localBoard.stats) as StatHistory
    const phase = () => (crt.localBoard && crt.localBoard.phase) as GamePhase

    expect(stats().values.size).toBe(0)
    expect(stats().lastTurns.size).toBe(0)
    expect(phase()).toBe(GamePhase.BeforeStart)

    expect(crt.getTile(crt.ll).owner).toBe(Player.Zero)
    expect(crt.getTile(crt.ur).owner).toBe(Player.One)
    expect(crt.getTile(crt.ul).owner).toBe(Player.Two)
    expect(crt.getTile(crt.lr).owner).toBe(Player.Three)

    // 1. Setup
    crt.queueMove(crt.ul, Hex.RIGHT_DOWN, Player.Two) // get out of the way
    crt.doMoves()
    crt.tick() // turn 0 ends
    expect(phase()).toBe(GamePhase.Started)
    expect(stats().values.size).toBe(1)
    expect(stats().last.hexes.get(Player.Zero, -1)).toBe(1)
    expect(stats().last.hexes.get(Player.Two, -1)).toBe(2)
    expect(stats().last.pop.get(Player.Two, -1)).toBe(21)

    // 2. Zero captures Two
    crt.queueMove(crt.ll, Hex.UP, Player.Zero) // Zero captures Two
    crt.doMoves()
    crt.tick() // turn 1 ends
    expect(stats().values.size).toBe(2)
    expect(stats().last.hexes.get(Player.Two, -1)).toBe(-1)
    expect(stats().last.hexes.get(Player.Zero, -1)).toBe(3)
    expect(stats().last.pop.get(Player.Two, -1)).toBe(-1)
    expect(stats().last.pop.get(Player.Zero, -1)).toBe(29)
    expect(stats().lastTurns.size).toBe(1)
    expect(stats().lastTurns.get(Player.Two, -1)).toBe(1)

    // Player Two peaked at 21 pop in 2 hexes
    expect(stats().maxes.pop.get(Player.Two, -1)).toBe(21)
    expect(stats().maxes.hexes.get(Player.Two, -1)).toBe(2)
    expect(stats().maxes.pop.get(Player.Zero, -1)).toBe(29)
    expect(stats().maxes.pop.maxValue).toBe(29)

    // 3. Three captures One
    crt.queueMove(crt.ur, Hex.LEFT_DOWN, Player.One) // get out of the way
    crt.doMoves()
    crt.queueMove(crt.lr, Hex.UP, Player.Three) // Three captures One
    crt.doMoves()
    crt.tick() // turn 2 ends
    expect(stats().last.hexes.get(Player.One, -1)).toBe(-1)
    expect(stats().lastTurns.get(Player.Two, -1)).toBe(1)
    expect(stats().lastTurns.get(Player.One, -1)).toBe(2)
    crt.tick() // turn 3 ends
    crt.tick() // turn 4 ends
    expect(stats().values.size).toBe(5)
    expect(stats().lastTurns.size).toBe(2)

    // 4. Three captures One — Game Over!
    crt.queueMove(crt.ul, Hex.RIGHT_DOWN, Player.Zero)
    crt.queueMove(Hex.RIGHT_UP, Hex.RIGHT_DOWN, Player.Zero) // Zero captures Three
    crt.doMoves()
    crt.doMoves()
    crt.tick() // turn 5 ends
    expect(stats().values.size).toBe(6)
    expect(stats().lastTurns.size).toBe(3)
    expect(stats().lastTurns.get(Player.Three, -1)).toBe(5)
    expect(phase()).toBe(GamePhase.Ended)
})
