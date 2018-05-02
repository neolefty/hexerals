import {ColorPodge} from "./ColorPodge";

it('color distance', () => {
    const c0 = [1, 2, 3];
    const c1 = [2, 4, 6];
    const c2 = [0, 0, 0];
    expect(ColorPodge.dist2(c0, c1)).toBeCloseTo(14);
    expect(ColorPodge.dist2(c0, c2)).toBeCloseTo(14);
    expect(ColorPodge.dist2(c1, c2)).toBeCloseTo(56);
});

it('color podge basics', () => {
    let cp = new ColorPodge();
    expect(cp.hsluvColors.size).toEqual(0);
    cp = cp.addRandomColor();
    cp = cp.addRandomColor();
    expect(cp.hsluvColors.size).toEqual(2);

    // disperse by 0 ...
    let cpDispersed = cp.disperse(0);
    expect(cpDispersed.hsluvColors.size).toEqual(2);
    // ... should have no effect except on
    for (let i = 0; i < 2; ++i)
        for (let j = 0; j < 3; ++j)
            expect(cpDispersed.hsluvColors.get(i)[j]).toEqual(cp.hsluvColors.get(i)[j]);

    const c0 = cp.hsluvColors.get(0), c1 = cp.hsluvColors.get(1);
    expect(c0[3]).toBeCloseTo(c1[3]);
    expect(c0[3]).toBeCloseTo(ColorPodge.dist2(c0, c1));
    expect(cp.closestTwo()).toEqual(ColorPodge.dist2(c0, c1));

    cp = cp.addRandomColor();
    cp = cp.addRandomColor();
    cpDispersed = cp.disperse(1);
    // console.log(`before: ${cp.closestTwo()}; after: ${cpDispersed.closestTwo()}`);
    expect(cpDispersed.closestTwo()).toBeGreaterThan(cp.closestTwo());
});