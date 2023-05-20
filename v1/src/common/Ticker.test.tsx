import * as React from 'react';
import ReactSixteenAdapter from 'enzyme-adapter-react-16';
import * as enzyme from 'enzyme';
import {Ticker} from './Ticker';

jest.useRealTimers()

const sleep = (ms: number) => {
    return new Promise(
        resolve => setTimeout(
            () => resolve(`${ms} ms elapsed`),
            ms,
        )
    )
}

const createTicker = (tick: () => void): JSX.Element => (
    <Ticker
        tick={tick}
        tickMillis={10}
    >
        <p>1</p>
        <p>2</p>
    </Ticker>
)

it('renders children', () => {
    enzyme.configure({adapter: new ReactSixteenAdapter()});
    const ticker = createTicker(() => {})
    expect(enzyme.render(ticker).text()).toBe('12')
})

it('creates a timer', async () => {
    let n = 0;
    const ticker = createTicker(() => {
        n += 1
    })
    const wrapper = enzyme.mount(ticker)
    await sleep(35)
    // I know this seem excessively lax, but the test environment can be pretty resource-constrained
    expect(n).toBeGreaterThanOrEqual(2)
    wrapper.unmount()
    const m = n
    await sleep(25)
    expect(m).toBe(n)
    expect(n).toBeLessThan(7)

    // sleep(25).then(() => {
    //     expect(n).toBeGreaterThanOrEqual(2)
    //     const m = n
    //     wrapper.unmount()
    // })
});
