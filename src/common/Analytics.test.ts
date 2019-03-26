import {
    AnalyticsAction,
    AnalyticsCategory, AnalyticsLabel,
    logAnalyticsEvent,
    registerTagger,
    Tagger,
    unregisterTagger
} from './Analytics';
import {CycleReducerTester} from '../game/model/cycle/CycleReducerTester';
import {Hex} from '../game/model/hex/Hex';
import {Player} from '../game/model/players/Players';

it('registers and unregisters taggers', () => {
    let n = 0
    const key = Symbol('test')
    registerTagger(key,
        () => n += 1
    )
    logAnalyticsEvent(AnalyticsAction.test)
    expect(n).toBe(1)
    logAnalyticsEvent(AnalyticsAction.test)
    expect(n).toBe(2)
    unregisterTagger(key)
    logAnalyticsEvent(AnalyticsAction.test)
    expect(n).toBe(2)
})

class TestTagger {
    lastAction?: AnalyticsAction
    lastCategory?: AnalyticsCategory
    lastLabel?: AnalyticsLabel
    lastValue?: string
    lastDeets?: {}
    tagger: Tagger = (action, category, label, value, deets) => {
        this.lastAction = action
        this.lastCategory = category
        this.lastLabel = label
        this.lastValue = value
        this.lastDeets = deets
    }
}

it('logs a win', () => {
    const key = Symbol('test')
    const tagger = new TestTagger()
    registerTagger(key, tagger.tagger)

    const crt = new CycleReducerTester()
    crt.useCornersArranger()
    crt.changeLocalOption('startingPop', 20)
    crt.openLocalGame(3, 3)
    expect(tagger.lastAction).toBe(AnalyticsAction.start)

    crt.queueMove(crt.ur, Hex.DOWN, Player.One) // get out of the way
    crt.queueMove(crt.ll, Hex.RIGHT_UP, Player.Zero)
    crt.queueMove(crt.ll.plus(Hex.RIGHT_UP), Hex.RIGHT_UP, Player.Zero) // capture
    crt.doMoves()
    expect(crt.getTile(crt.lr).owner).toBe(Player.One) // not captured yet
    expect(tagger.lastAction).toBe(AnalyticsAction.start)
    crt.doMoves()
    expect(tagger.lastAction).toBe(AnalyticsAction.end)
    expect(crt.getTile(crt.ur).owner).toBe(Player.Zero)
    // captured capital, so should also own player one's old tile
    expect(crt.getTile(crt.lr).owner).toBe(Player.Zero)
    expect(tagger.lastLabel).toBe(AnalyticsLabel.win)

    unregisterTagger(key)
})

it('logs a loss', () => {
    const key = Symbol('test')
    const tagger = new TestTagger()
    registerTagger(key, tagger.tagger)

    const crt = new CycleReducerTester()
    crt.useCornersArranger()
    crt.changeLocalOption('startingPop', 20)
    crt.openLocalGame(3, 3)
    expect(tagger.lastAction).toBe(AnalyticsAction.start)

    crt.queueMove(crt.ll, Hex.UP, Player.Zero) // get out of the way
    crt.queueMove(crt.ur, Hex.LEFT_DOWN, Player.One)
    crt.queueMove(crt.ur.plus(Hex.LEFT_DOWN), Hex.LEFT_DOWN, Player.One) // capture
    crt.doMoves()
    expect(tagger.lastAction).toBe(AnalyticsAction.start)
    crt.doMoves()
    expect(tagger.lastAction).toBe(AnalyticsAction.end)
    expect(crt.getTile(crt.ll).owner).toBe(Player.One)
    // captured capital, so should also own player one's old tile
    expect(crt.getTile(crt.ul).owner).toBe(Player.One)
    expect(tagger.lastLabel).toBe(AnalyticsLabel.lose)

    unregisterTagger(key)
})