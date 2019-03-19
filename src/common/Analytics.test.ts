import {
    AnalyticsAction,
    AnalyticsCategory, AnalyticsLabel,
    logAnalyticsEvent,
    registerTagger,
    Tagger,
    unregisterTagger
} from './Analytics';
import {BoardReducerTester} from '../game/board/model/BoardReducerTester';
import {CycleReducerTester} from '../game/board/model/CycleReducerTester';

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

it('logs game events', () => {
    const key = Symbol('test')
    const tagger = new TestTagger()
    registerTagger(key, tagger.tagger)

    const crt = new CycleReducerTester()
    crt.openLocalGame()
    expect(tagger.lastAction).toBe(AnalyticsAction.start)

    unregisterTagger(key)
})