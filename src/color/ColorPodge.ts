import {List} from 'immutable';
import {DriftColor} from './DriftColor';

// A collection of colors in CIE space
export class ColorPodge {

    static readonly DELTAS: number[][] = [
        [-1, 0, 0], [0, -1, 0], [0, 0, -1], [1, 0, 0], [0, 1, 0], [0, 0, 1],
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
    disperse(f: number): ColorPodge {
        // const before = this.closestTwo();
        const result = new ColorPodge(List(this.driftColors.map(
            (color: DriftColor) => this.disperseOne(color, f)
        )));
        // console.log(`${Math.round(before)} -- drift ${f} -- ${result.toString()}`);
        // console.log(`${this.toString()} -- drift ${f} -- ${result.toString()}`);
        return result;
    }

    closestTwo(): number {
        return this.driftColors.reduce(
            (champ: number, contender: DriftColor) =>
                Math.min(champ, this.minDist(contender)),
            Infinity
        );
    }

    // try moving color a distance f in each of 6 directions and return the one with the
    // largest minimum distance from all other colors
    disperseOne(color: DriftColor, f: number): DriftColor {
        let result = color;
        let maxMinDist = this.minDist(color);
        ColorPodge.DELTAS.forEach(delta => {
            const candidate = color.shift(delta, f);
            const dist = this.minDist(candidate, color);
            // console.log(`${color} -- consider ${c} -- ${d}`);
            if (dist > maxMinDist) {
                result = candidate;
                maxMinDist = dist;
            }
        });
        return result;
    }

    // what is the distance to the nearest other color in this podge?
    // if ignore is supplied, skip it in the list of colors
    // TODO memoize
    minDist(color: DriftColor, ignore?: DriftColor) {
        let result = Infinity;
        this.driftColors.forEach((dc: DriftColor) => {
            if (dc !== color && dc !== ignore)
                result = Math.min(result, dc.perceptualDistance(color));
        });
        return result;
    }

    toString(): string {
        let result = `${Math.round(this.closestTwo())}`;
        this.driftColors.forEach(
            (dc) => result = result + `; ${dc.toHsluvString()}`
        );
        return result;
    }
}
