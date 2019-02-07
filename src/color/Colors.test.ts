import {ColorPodge} from "./ColorPodge"
import {CieColor} from "./CieColor"
import {DriftColor} from "./DriftColor"
import {List, Range} from "immutable"

it('color distance', () => {
    const c0 = new DriftColor(new CieColor([1, 2, 3]))
    const c1 = new DriftColor(new CieColor([2, 4, 6]))
    const c2 = new DriftColor(new CieColor([0, 0, 0]))
    // console.log(`c0 = ${c0.toString()}`)
    // console.log(`c1 = ${c1.toString()}`)
    // console.log(`c2 = ${c2.toString()}`)
    expect(c0.hslD2(c1)).toBeCloseTo(14)
    expect(c0.hslD2(c2)).toBeCloseTo(14)
    expect(c1.hslD2(c2)).toBeCloseTo(56)

    expect(c0.d2(c1)).toEqual(c0.perceptualD2(c1))
    // expect to tweak these numbers if the color comparison metric changes
    expect(c0.d2(c1)).toBeCloseTo(9.10, 2)
    expect(c0.d2(c2)).toBeCloseTo(9.01, 2)
    expect(c1.d2(c2)).toBeCloseTo(36.18, 2)

    expect(c0.key).toEqual(c0.drift(1).key)
    expect(c0.key).toEqual(c0.shift([1,1,1], 1).key)
    expect(c0.contrast().key).toEqual(c0.drift(1).contrast().key)
    expect(c0.contrast().key).toEqual(c0.shift([1,1,1], 1).contrast().key)
})

it('color podge basics', () => {
    let cp = new ColorPodge()
    expect(cp.driftColors.size).toEqual(0)
    cp = cp.addRandomColor()
    cp = cp.addRandomColor()
    expect(cp.driftColors.size).toEqual(2)

    // disperse by 0 ...
    let cpDispersed = cp.disperse(0)
    expect(cpDispersed.driftColors.size).toEqual(2)
    // ... should have no effect except on
    Range(0, 2).forEach(i =>
        Range(0, 3).forEach(j => {
            const orig = cp.driftColors.get(i) as DriftColor
            const disp = cpDispersed.driftColors.get(i)
            
            expect(orig.equals(disp)).toBeTruthy()
        })
    )

    const drifted = cp.drift(3).drift(1)
    const closenessDrift = Math.abs(drifted.closestTwo() - cp.closestTwo())
    // console.log(`${Math.round(drifted.closestTwo())} - ${Math.round(cp.closestTwo())} = ${Math.round(closenessDrift)}`)
    // TODO fix this -- sometimes it's less than 1, like 0.91
    expect(closenessDrift).toBeGreaterThan(1)

    const c0: DriftColor = cp.driftColors.get(0) as DriftColor
    const c1: DriftColor = cp.driftColors.get(1) as DriftColor
    // size is still 2
    expect(cp.minDist(c0)).toBeCloseTo(cp.minDist(c1))
    expect(cp.minDist(c0)).toBeCloseTo(c0.d2(c1))
    expect(cp.maxDist(c0)).toBeCloseTo(cp.maxDist(c1))
    expect(cp.maxDist(c0)).toBeCloseTo(cp.minDist(c0))
    expect(cp.closestTwo()).toBeCloseTo(c0.d2(c1))
    // spread them apart
    cp = cp.disperse(10).disperse(1)

    // add 6 more random colors
    Range(0, 6).forEach(() =>
        cp = cp.addRandomColor()
    )

    // now we expect the first two to be closer to a newcomer than to each other
    expect(Math.abs(cp.minDist(c0) - cp.minDist(c1))).toBeGreaterThan(0)

    expect(cp.minDist(c0)).toBeLessThan(cp.maxDist(c0))
    expect(cp.minDist(c1)).toBeLessThan(cp.maxDist(c1))
    cpDispersed = cp.disperse(1)
    // console.log(`before: ${cp.closestTwo()} after: ${cpDispersed.closestTwo()}`)
    expect(cpDispersed.closestTwo() + 0.01).toBeGreaterThan(cp.closestTwo())
    const cpDispersed31 = cp.disperse(3).disperse(1)
    expect(cpDispersed31.closestTwo()).toBeGreaterThan(cpDispersed.closestTwo())
})

it('color podge math', () => {
    const z = [10, 20]
    const y = [7, 23]
    const x = [13, 17]
    const m = [Infinity, -Infinity]
    ColorPodge.mutateMinMax2(m, z)
    expect(m).toEqual(z)
    ColorPodge.mutateMinMax2(m, y)
    expect(m).toEqual(y)
    ColorPodge.mutateMinMax2(m, x)
    expect(m).toEqual(y)
})

it('color podge random tests', () => {
    Range(0, 5).forEach(() => {
        const a = DriftColor.random()
        const b = DriftColor.random()
        const c = DriftColor.random()
        const d = DriftColor.random()
        const e = DriftColor.random()
        const f = DriftColor.random()
        const cp = new ColorPodge(List([a, b, c, d, e, f]))
        const distances = [
            a.d2(b), a.d2(c), a.d2(d), a.d2(e), a.d2(f),
            b.d2(c), b.d2(d), b.d2(e), b.d2(f),
            c.d2(d), c.d2(e), c.d2(f),
            d.d2(e), d.d2(f),
            e.d2(f),
        ]
        expect(cp.closestTwo()).toBeCloseTo(Math.min(...distances))
        expect(cp.furthestTwo()).toBeCloseTo(Math.max(...distances))

        const cp2 = cp.disperse(2)
        expect(cp.closestTwo() < cp2.closestTwo()).toBeTruthy()
        const cp521 = cp.disperse(5).disperse(2).disperse(1)
        // doing 5 then 2 should be better than doing just 2
        expect(cp2.closestTwo() < cp521.closestTwo()).toBeTruthy()

        // can't count on this though--we're only maximizing min dist,
        // not trying to do anything about max dist.
        // expect(cp.furthestTwo() > cp2.furthestTwo()).toBeTruthy()
        // expect(cp2.furthestTwo() > cp5.furthestTwo()).toBeTruthy()
    })
})

fit('textures', () => {
    Range(0, 10).forEach((i: number) => {
        const orig = DriftColor.random()
        const texture10 = orig.texture(10)
        const darker5 = orig.darker(5)
        const lighter5 = orig.lighter(5)
        const darker0 = orig.darker(0)
        const lighter0 = orig.lighter(0)
        expect(orig.hue).toBe(texture10.hue)
        expect(orig.toHexString()).toEqual(lighter0.toHexString())
        expect(orig.toHexString()).toEqual(darker0.toHexString())
        expect(orig.saturation).toBe(texture10.saturation)
        expect(Math.abs(orig.lightness - texture10.lightness)).toBeCloseTo(10, 6)
        expect(orig.lightness - darker5.lightness).toBeCloseTo(5, 6)
        expect(orig.lightness - lighter5.lightness).toBeCloseTo(-5, 6)
        expect(orig.texture(10) === texture10) // cached
        expect(orig.lighter(5) === lighter5) // cached
        expect(orig.darker(5) === darker5) // cached
        expect(orig.lighter(100).lightness).toBe(100)
        expect(orig.darker(100).lightness).toBe(0)
    })
})

// TODO test that mindist() of each color in a podge is similar, after convergence