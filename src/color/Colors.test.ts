import {ColorPodge} from "./ColorPodge";
import {CieColor} from "./CieColor";
import {DriftColor} from "./DriftColor";

it('color distance', () => {
    const c0 = new DriftColor(new CieColor([1, 2, 3]));
    const c1 = new DriftColor(new CieColor([2, 4, 6]));
    const c2 = new DriftColor(new CieColor([0, 0, 0]));
    console.log(`c0 = ${c0.toString()}`);
    console.log(`c1 = ${c1.toString()}`);
    console.log(`c2 = ${c2.toString()}`);
    expect(c0.d2(c1)).toBeCloseTo(14);
    expect(c0.d2(c2)).toBeCloseTo(14);
    expect(c1.d2(c2)).toBeCloseTo(56);
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

    const drifted = cp.drift(1);
    const closenessDrift = Math.abs(drifted.closestTwo() - cp.closestTwo());
    console.log(`${Math.round(drifted.closestTwo())} - ${Math.round(cp.closestTwo())} = ${Math.round(closenessDrift)}`);
    expect(closenessDrift).toBeGreaterThan(1);

    //
    const c0: DriftColor = cp.driftColors.get(0);
    const c1: DriftColor = cp.driftColors.get(1);
    expect(cp.minDist(c0)).toBeCloseTo(cp.minDist(c1));
    expect(cp.minDist(c0)).toBeCloseTo(c0.d2(c1));
    expect(cp.closestTwo()).toEqual(c0.d2(c1));

    cp = cp.addRandomColor();
    cp = cp.addRandomColor();
    cpDispersed = cp.disperse(1);
    console.log(`before: ${cp.closestTwo()}; after: ${cpDispersed.closestTwo()}`);
    expect(cpDispersed.closestTwo() + 0.01).toBeGreaterThan(cp.closestTwo());
});

// TODO test that after divergence, drifting reduces min distance
// TODO test that mindist of each color in a podge is similar