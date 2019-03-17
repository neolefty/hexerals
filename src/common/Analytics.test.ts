import {AnalyticsAction, logAnalyticsEvent, registerTagger, unregisterTagger} from './Analytics';

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