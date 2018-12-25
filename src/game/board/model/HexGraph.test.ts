import {HexCoord} from './HexCoord';
import {Set} from 'immutable';
import {connected, connectedSets, flood} from './HexGraph';

const randomWalk = (n: number, start: HexCoord): Set<HexCoord> => {
    let result = Set<HexCoord>()
    let here: HexCoord = start
    while (result.size < n) {
        result = result.add(here)
        here = here.getNeighbors().get(
            Math.floor(Math.random() * here.getNeighbors().size)
        )
    }
    return result
}

it ('floods', () => {
    const n = 3
    const o = HexCoord.ORIGIN
    const far = HexCoord.getCart(n * 4, 0)
    const byO = randomWalk(n, o)
    const byFar = randomWalk(n, far)
    const both = byO.union(byFar)

    expect(byO.size).toEqual(n)
    expect(byO.equals(flood(o, byO).flooded)).toBeTruthy()
    expect(flood(o, byO).remaining.size).toBe(0)

    expect(flood(o, both).flooded.equals(byO)).toBeTruthy()
    expect(flood(o, both).remaining.equals(byFar)).toBeTruthy()
    expect(flood(far, both).flooded.equals(byFar)).toBeTruthy()
    expect(flood(far, both).remaining.equals(byO)).toBeTruthy()
})

it ('finds disconnected sets', () => {
    const n = 3
    const o = HexCoord.ORIGIN
    const far = HexCoord.getCart(n * 4, 0)
    const beyond = HexCoord.getCart(n * 8, 0)
    const byO = randomWalk(n, o)
    const byFar = randomWalk(n, far)
    const byBeyond = randomWalk(n, beyond)
    const oAndFar = byO.union(byFar)
    const all = oAndFar.union(byBeyond)

    expect(oAndFar.size).toEqual(n * 2)
    expect(all.size).toEqual(n * 3)

    expect(connected(byO)).toBeTruthy()
    expect(connected(byFar)).toBeTruthy()
    expect(connected(oAndFar)).toBeFalsy()
    expect(connected(all)).toBeFalsy()

    const redivided = connectedSets(all)
    expect(redivided.size).toEqual(3)
    expect(redivided.contains(byO)).toBeTruthy()
    expect(redivided.contains(byFar)).toBeTruthy()
    expect(redivided.contains(byBeyond)).toBeTruthy()
})