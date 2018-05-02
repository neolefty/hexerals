import {ColorPodge} from "./ColorPodge";

it('something', () => {
    let cp = new ColorPodge();
    expect(cp.hsluvColors.size).toEqual(0);
    cp = cp.addRandomColor();
    cp = cp.addRandomColor();
    expect(cp.hsluvColors.size).toEqual(2);
    let cpDispersed = cp.disperse(0);
    expect(cpDispersed.hsluvColors.size).toEqual(2);
    // dispersal by 0 should have no effect except on
    for (let i = 0; i < 2; ++i)
        for (let j = 0; j < 3; ++j)
            expect(cpDispersed.hsluvColors.get(i)[j]).toEqual(cp.hsluvColors.get(i)[j]);

    cp.calculateDistances();
    const c0 = cp.hsluvColors.get(0), c1 = cp.hsluvColors.get(1);
    expect(c0[3]).toBeCloseTo(c1[3]);
    expect(c0[3]).toBeCloseTo(ColorPodge.dist2(c0, c1));
    console.log(`${c0} - ${c1} = ${ColorPodge.dist2(c0, c1)}`);
    expect(cp.closestTwo()).toEqual(ColorPodge.dist2(c0, c1));
});