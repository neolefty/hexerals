import {List} from 'immutable';

export class ColorPodge {
    static randomColor(): number[] {
        return [
            /* TODO even p across CIELUV for uniform perceptual distribution*/
            Math.random() * 360,
            Math.random() * 100,
            Math.random() * 50 + 50,
        ];
    }

    constructor(readonly hsluvColors: List<number[]> = List()) {}

    addRandomColor(): ColorPodge {
        return new ColorPodge(this.hsluvColors.push(ColorPodge.randomColor()));
    }
}
