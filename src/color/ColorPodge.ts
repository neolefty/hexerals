import {List} from 'immutable';

const MIN_BRIGHT = 50; // minimum allowed brightness
const MIN_SAT = 0; // minimum allowed saturation

// A collection of colors in CIE space
export class ColorPodge {
    static readonly DELTAS: number[][] = [
        [-1, 0, 0], [0, -1, 0], [0, 0, -1], [1, 0, 0], [0, 1, 0], [0, 0, 1],
    ];

    static randomColor(): number[] {
        return [
            /* TODO even p across CIELUV for uniform perceptual distribution*/
            Math.random() * 360,
            Math.random() * (100 - MIN_SAT) + MIN_SAT,
            Math.random() * (100 - MIN_BRIGHT) + MIN_BRIGHT,
            // TODO make this properly immutable by moving this value out of array into cache
            -Infinity, // hack: distance to nearest other color
        ];
    }

    static clamp(x: number, min: number, max: number): number {
        return Math.max(min, Math.min(x, max));
    }

    static dist2(a: number[], b: number[]): number {
        const dHueRaw = Math.abs(a[0] - b[0]), dSat = a[1] - b[1],
            dBright = a[2] - b[2];
        const dHue = dHueRaw < 180 ? dHueRaw : dHueRaw - 360;
        return dHue * dHue + dSat * dSat + dBright * dBright;
    }

    private static driftOne(color: number[], f: number) {
        return [
            (color[0] + Math.random() * f),
            ColorPodge.clamp(color[1] + Math.random() * f, MIN_SAT, 100),
            ColorPodge.clamp(color[2], MIN_BRIGHT, 100),
        ];
    }

    constructor(readonly hsluvColors: List<number[]> = List()) {}

    // populate nearest distances
    calculateDistances() {
        this.hsluvColors.forEach((c) => {
            c[3] = this.minDist2(c);
        });
    }

    addRandomColor(): ColorPodge {
        return new ColorPodge(this.hsluvColors.push(ColorPodge.randomColor()));
    }

    removeColor(x: number): ColorPodge {
        return new ColorPodge(this.hsluvColors.remove(x));
    }

    // random walk
    drift(f: number): ColorPodge {
        return new ColorPodge(List(this.hsluvColors.map(
            (color: number[]) => ColorPodge.driftOne(color, f)
        )));
    }

    // spread colors away from each other
    disperse(f: number): ColorPodge {
        return new ColorPodge(List(this.hsluvColors.map(
            (color: number[]) => this.disperseOne(color, f)
        )));
    }

    closestTwo(): number {
        return this.hsluvColors.reduce(
            (champ: number, contender: number[]) =>
                Math.min(champ, contender[3]),
            Infinity
        );
    }

    // try moving color a distance f in each of 6 directions and return the one with the
    // largest minimum distance from all other colors
    private disperseOne(color: number[], f: number): number[] {
        let result = color;
        let maxMinDist = this.minDist2(color); // baseline: no change
        ColorPodge.DELTAS.forEach(delta => {
            const c = [
                (delta[0] * f + color[0]) % 360,
                ColorPodge.clamp(delta[1] * f + color[1], MIN_SAT, 100),
                ColorPodge.clamp(delta[2] * f + color[2], MIN_BRIGHT, 100),
                Infinity, // hack: min dist from other colors
            ];
            const d = this.minDist2(c);
            c[3] = d;
            if (d > maxMinDist) {
                result = c;
                maxMinDist = d;
            }
        });
        return result;
    }

    // what is the distance to the nearest other color in this podge?
    private minDist2(color: number[]) {
        let result = Infinity;
        this.hsluvColors.forEach((c: number[]) => {
            if (c !== color)
                result = Math.min(result, ColorPodge.dist2(color, c));
        });
        return result;
    }
}
