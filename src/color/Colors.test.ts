import {ColorPodge} from "./ColorPodge";
import {CieColor} from "./CieColor";
import {DriftColor} from "./DriftColor";
import {List} from "immutable";

it('color distance', () => {
    const c0 = new DriftColor(new CieColor([1, 2, 3]));
    const c1 = new DriftColor(new CieColor([2, 4, 6]));
    const c2 = new DriftColor(new CieColor([0, 0, 0]));
    // console.log(`c0 = ${c0.toString()}`);
    // console.log(`c1 = ${c1.toString()}`);
    // console.log(`c2 = ${c2.toString()}`);
    expect(c0.normalizedDistance2(c1)).toBeCloseTo(14);
    expect(c0.normalizedDistance2(c2)).toBeCloseTo(14);
    expect(c1.normalizedDistance2(c2)).toBeCloseTo(56);

    expect(c0.d2(c1)).toEqual(c0.perceptualDistance2(c1));
    // expect to tweak these numbers if the color comparison metric changes
    expect(c0.d2(c1)).toBeCloseTo(9.10, 2);
    expect(c0.d2(c2)).toBeCloseTo(9.01, 2);
    expect(c1.d2(c2)).toBeCloseTo(36.18, 2);

    expect(c0.key).toEqual(c0.drift(1).key);
    expect(c0.key).toEqual(c0.shift([1,1,1], 1).key);
    expect(c0.contrast().key).toEqual(c0.drift(1).contrast().key);
    expect(c0.contrast().key).toEqual(c0.shift([1,1,1], 1).contrast().key);
});

it('color podge basics', () => {
    let cp = new ColorPodge();
    expect(cp.driftColors.size).toEqual(0);
    cp = cp.addRandomColor();
    cp = cp.addRandomColor();
    expect(cp.driftColors.size).toEqual(2);

    // disperse by 0 ...
    let cpDispersed = cp.disperse(0);
    expect(cpDispersed.driftColors.size).toEqual(2);
    // ... should have no effect except on
    for (let i = 0; i < 2; ++i)
        for (let j = 0; j < 3; ++j)
            expect(cpDispersed.driftColors.get(i)[j]).toEqual(cp.driftColors.get(i)[j]);

    const drifted = cp.drift(3).drift(1);
    const closenessDrift = Math.abs(drifted.closestTwo() - cp.closestTwo());
    // console.log(`${Math.round(drifted.closestTwo())} - ${Math.round(cp.closestTwo())} = ${Math.round(closenessDrift)}`);
    expect(closenessDrift).toBeGreaterThan(1);

    const c0: DriftColor = cp.driftColors.get(0);
    const c1: DriftColor = cp.driftColors.get(1);
    // size is still 2
    expect(cp.minDist(c0)).toBeCloseTo(cp.minDist(c1));
    expect(cp.minDist(c0)).toBeCloseTo(c0.d2(c1));
    expect(cp.maxDist(c0)).toBeCloseTo(cp.maxDist(c1));
    expect(cp.maxDist(c0)).toBeCloseTo(cp.minDist(c0));
    expect(cp.closestTwo()).toBeCloseTo(c0.d2(c1));
    // spread them apart
    cp = cp.disperse(10).disperse(1);

    // add 6 more random colors
    cp = cp.addRandomColor(); cp = cp.addRandomColor();
    cp = cp.addRandomColor(); cp = cp.addRandomColor();
    cp = cp.addRandomColor(); cp = cp.addRandomColor();

    // now we expect the first two to be closer to a newcomer than to each other
    expect(Math.abs(cp.minDist(c0) - cp.minDist(c1))).toBeGreaterThan(0);

    expect(cp.minDist(c0)).toBeLessThan(cp.maxDist(c0));
    expect(cp.minDist(c1)).toBeLessThan(cp.maxDist(c1));
    cpDispersed = cp.disperse(1);
    // console.log(`before: ${cp.closestTwo()}; after: ${cpDispersed.closestTwo()}`);
    expect(cpDispersed.closestTwo() + 0.01).toBeGreaterThan(cp.closestTwo());
    const cpDispersed31 = cp.disperse(3).disperse(1);
    expect(cpDispersed31.closestTwo()).toBeGreaterThan(cpDispersed.closestTwo());
});

it('color podge math', () => {
    const z = [10, 20];
    const y = [7, 23];
    const x = [13, 17];
    const m = [Infinity, -Infinity];
    ColorPodge.mutateMinMax2(m, z);
    expect(m).toEqual(z);
    ColorPodge.mutateMinMax2(m, y);
    expect(m).toEqual(y);
    ColorPodge.mutateMinMax2(m, x);
    expect(m).toEqual(y);
});

it('color podge random tests', () => {
    for (let i = 0; i < 5; ++i) {
        const a = DriftColor.random();
        const b = DriftColor.random();
        const c = DriftColor.random();
        const d = DriftColor.random();
        const e = DriftColor.random();
        const f = DriftColor.random();
        const cp = new ColorPodge(List([a, b, c, d, e, f]));
        const distances = [
            a.d2(b), a.d2(c), a.d2(d), a.d2(e), a.d2(f),
            b.d2(c), b.d2(d), b.d2(e), b.d2(f),
            c.d2(d), c.d2(e), c.d2(f),
            d.d2(e), d.d2(f),
            e.d2(f),
        ];
        expect(cp.closestTwo()).toBeCloseTo(Math.min(...distances));
        expect(cp.furthestTwo()).toBeCloseTo(Math.max(...distances));

        const cp2 = cp.disperse(2);
        expect(cp.closestTwo() < cp2.closestTwo()).toBeTruthy();
        const cp521 = cp.disperse(5).disperse(2).disperse(1);
        // doing 5 then 2 should be better than doing just 2
        expect(cp2.closestTwo() < cp521.closestTwo()).toBeTruthy();

        // can't count on this though--we're only maximizing min dist,
        // not trying to do anything about max dist.
        // expect(cp.furthestTwo() > cp2.furthestTwo()).toBeTruthy();
        // expect(cp2.furthestTwo() > cp5.furthestTwo()).toBeTruthy();
    }
});

// TODO test that mindist() of each color in a podge is similar, after convergence