import {List} from 'immutable';
import {DriftColor} from './DriftColor';

// A collection of colors in CIE space
export class ColorPodge {

    static readonly DELTAS: number[][] = [
        // index 1 is larger because LCh Chroma is scaled down
        // and won't shift at all if we use 1.
        [-1, 0, 0], [0, -3, 0], [0, 0, -1], [1, 0, 0], [0, 3, 0], [0, 0, 1],
    ];

    constructor(readonly driftColors: List<DriftColor> = List()) {}

    addRandomColor(): ColorPodge {
        return new ColorPodge(this.driftColors.push(DriftColor.random()));
    }

    removeColor(idx: number): ColorPodge {
        return new ColorPodge(this.driftColors.remove(idx));
    }

    // random walk
    drift(f: number): ColorPodge {
        return new ColorPodge(List(this.driftColors.map(
            (color: DriftColor) => color.drift(f)
        )));
    }

    // spread colors away from each other
    disperse(stepSize: number): ColorPodge {
        // const before = this.closestTwo();
        const result = new ColorPodge(List(this.driftColors.map(
            (color: DriftColor) => this.disperseOne(color, stepSize)
        )));
        // console.log(`${Math.round(before)} -- drift ${f} -- ${result.toString()}`);
        // console.log(`${this.toString()} -- drift ${f} -- ${result.toString()}`);
        return result;
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
        ColorPodge.DELTAS.forEach(delta => {
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
