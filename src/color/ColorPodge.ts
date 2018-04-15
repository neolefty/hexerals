import {List} from 'immutable';

const MIN_BRIGHT = 50; // minimum allowed brightness
const MIN_SAT = 0; // minimum allowed saturation

export class ColorPodge {
    static randomColor(): number[] {
        return [
            /* TODO even p across CIELUV for uniform perceptual distribution*/
            Math.random() * 360,
            Math.random() * (100 - MIN_SAT) + MIN_SAT,
            Math.random() * (100 - MIN_BRIGHT) + MIN_BRIGHT,
        ];
    }

    constructor(readonly hsluvColors: List<number[]> = List()) {}

    addRandomColor(): ColorPodge {
        return new ColorPodge(this.hsluvColors.push(ColorPodge.randomColor()));
    }

    removeColor(x: number): ColorPodge {
        return new ColorPodge(this.hsluvColors.remove(x));
    }

    diverge(f: number): ColorPodge {
        return new ColorPodge(List(this.hsluvColors.map(
            (color: number[]) => this.drift(color, f)
        )));
    }

    private clamp(x: number, min: number, max: number) {
        return Math.max(min, Math.min(x, max));
    }

    private drift(color: number[], f: number) {
        return [
            (color[0] + Math.random() * f),
            this.clamp(color[1] + Math.random() * f, MIN_SAT, 100),
            this.clamp(color[2], MIN_BRIGHT, 100),
        ];
    }
}
