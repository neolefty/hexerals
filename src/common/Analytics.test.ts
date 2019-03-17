import {AnalyticsAction, logAnalyticsEvent, registerTagger, Tagger, unregisterTagger} from './Analytics';

it('registers and unregisters taggers', () => {
    let n = 0
    const key = Symbol('test')
    registerTagger(key,
        (/*action, deets*/) => n += 1
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
    lastDeets?: {}
    tagger: Tagger = (action, deets) => {
        this.lastAction = action
        this.lastDeets = deets
    }
}

it('logs game events', () => {
    const key = Symbol('test')
    const tagger = new TestTagger()
    registerTagger(key, tagger.tagger)


})