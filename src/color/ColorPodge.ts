import {List} from 'immutable';
import {DriftColor} from './DriftColor';

// A collection of colors in CIE space
export class ColorPodge {
    static readonly HSV_DELTAS: number[][] = [
        // index 1 is larger because LCh Chroma is scaled down saturation
        // and won't shift at all if we use 1 -- shifts happen in HSV space.
        [-1, 0, 0], [0, -3, 0], [0, 0, -1], [1, 0, 0], [0, 3, 0], [0, 0, 1],
    ];

    // The poor programmer's version, but still
    static readonly ANNEAL = [16, 13, 10, 7, 5, 5, 3, 3, 2, 1, 1]

    static MAX_DISPERSION_HISTORY = 320;
    static SETTLED_THRESHOLD = 150;

    static construct = (numColors: number, anneal: boolean = true) => {
        let result = new ColorPodge()
        while (result.driftColors.size < numColors)
            result = result.addRandomColor()
        if (anneal)
            ColorPodge.ANNEAL.forEach(
                x => result = result.disperse(x)
            )
        return result
    }

    constructor(
        readonly driftColors: List<DriftColor> = List(),
        readonly neverSettle: boolean = true,
        // if these aren't set, tracking settling is reset
        readonly settled: boolean = false,  // has dispersion settled down?
        // history of the last few closestTwo score
        readonly dispersionHistory: List<number> = List(),
    ) {}

    addRandomColor(): ColorPodge {
        // reset settlement tracking because a new color is in the mix
        return new ColorPodge(
            this.driftColors.push(DriftColor.random()),
            this.neverSettle,
        );
    }

    removeColor(idx: number): ColorPodge {
        // reset settlement tracking because a color has been removed
        return new ColorPodge(
            this.driftColors.remove(idx),
            this.neverSettle,
        );
    }

    // random walk
    drift(f: number): ColorPodge {
        // reset settlement tracking because colors have been shuffled
        return new ColorPodge(
            List(this.driftColors.map((color: DriftColor) => color.drift(f))),
            this.neverSettle,
        );
    }

    // spread colors away from each other
    disperse(stepSize: number): ColorPodge {
        if (this.settled)
            return this;

        // if this closestTwo score appears twice in our history, we're settled.
        const c = this.closestTwo();
        const newSettled = (!this.neverSettle) && this.dispersionHistory.count(
            x => x === c
        ) >= ColorPodge.SETTLED_THRESHOLD;
        if (newSettled)
            return new ColorPodge(
                this.driftColors,
                this.neverSettle,
                newSettled,
                this.dispersionHistory,
            );

        // not settled, so disperse again
        let newDispHist: List<number> = this.dispersionHistory.push(this.closestTwo());
        if (newDispHist.size > ColorPodge.MAX_DISPERSION_HISTORY)
            newDispHist = newDispHist.remove(0);
        const newColors: List<DriftColor> = List(
            this.driftColors.map(
                (color: DriftColor) => this.disperseOne(color, stepSize)));
        return new ColorPodge(
            newColors,
            this.neverSettle,
            newSettled,
            newDispHist,
        );
        // console.log(`${Math.round(before)} -- drift ${f} -- ${result.toString()}`);
        // console.log(`${this.toString()} -- drift ${f} -- ${result.toString()}`);
    }

    // The perceptual distance between the closest two colors
    closestTwo(): number { return this.closestFurthestTwo()[0]; }

    // The perceptual distance between the furthest two colors
    furthestTwo(): number { return this.closestFurthestTwo()[1]; }

    /* tslint:disable:member-ordering */
    private readonly closestFurtherTwoCache: number[] = [Infinity, -Infinity];
    /* tslint:enable */
    closestFurthestTwo(): number[] {
        if (this.closestFurtherTwoCache[0] === Infinity)
            if (this.driftColors.size <= 1)
                ColorPodge.mutateMinMax2(this.closestFurtherTwoCache, [0, 0]);
            else
                this.driftColors.forEach((color: DriftColor) =>
                    ColorPodge.mutateMinMax2(
                        this.closestFurtherTwoCache, this.minMaxDist(color)));
        return this.closestFurtherTwoCache;
    }

    /* tslint:disable:member-ordering */
    static mutateMinMax2(a: number[], b: number[]) {
        a[0] = Math.min(a[0], b[0]);
        a[1] = Math.max(a[1], b[1]);
    }
    /* tslint:enable */

    // try moving color a distance f in each of 6 directions and return the one with the
    // largest minimum distance from all other colors
    disperseOne(color: DriftColor, f: number): DriftColor {
        let result = color;
        let maxMinDist = this.minDist(color);
        ColorPodge.HSV_DELTAS.forEach(delta => {
            const candidate = color.shift(delta, f);
            const dist = this.minDist(candidate, color, true);
            // console.log(`${color} -- consider ${c} -- ${d}`);
            if (dist > maxMinDist) {
                result = candidate;
                maxMinDist = dist;
            }
        });
        return result;
    }

    minDist(color: DriftColor, ignore?: DriftColor, ignoreCache: boolean = false) {
        return this.minMaxDist(color, ignore, ignoreCache)[0];
    }

    maxDist(color: DriftColor, ignore?: DriftColor, ignoreCache: boolean = false) {
        return this.minMaxDist(color, ignore, ignoreCache)[1];
    }

    /* tslint:disable:member-ordering */
    private readonly minMaxDistCache = {};
    /* tslint:enable */
    // what are the distances to the nearest and farthest other color in this podge?
    // if ignore is supplied, skip it in the list of colors
    minMaxDist(color: DriftColor, ignore?: DriftColor, ignoreCache: boolean = false) {
        let result: number[] = this.minMaxDistCache[color.key];
        if (ignoreCache || !result) {
            result = [Infinity, -Infinity];
            this.driftColors.forEach((otherColor: DriftColor) => {
                if (otherColor !== color && otherColor !== ignore) {
                    // const pd = dc.normalizedDistance2(color);
                    const pd = otherColor.perceptualDistance2(color);
                    ColorPodge.mutateMinMax2(result, [pd, pd]);
                }
            });
            if (!ignoreCache)
                this.minMaxDistCache[color.key] = result;
        }
        return result;
    }

    toString(): string {
        let result = `${Math.round(this.closestTwo())}`;
        this.driftColors.forEach(
            (dc) => result = result + `; ${dc.toHslString()}`
        );
        return result;
    }
}
