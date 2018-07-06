import {CieColor} from './CieColor';

export class DriftColor {
    // allowed limits on brightness & saturation when drifting (hsluv)
    static readonly MIN_BRIGHT = 30;
    static readonly MAX_BRIGHT = 80;
    static readonly SPAN_BRIGHT = DriftColor.MAX_BRIGHT - DriftColor.MIN_BRIGHT;
    static readonly RECIP_BRIGHT = 1 / DriftColor.SPAN_BRIGHT;
    static readonly MID_BRIGHT = (DriftColor.MIN_BRIGHT + DriftColor.MAX_BRIGHT) / 2;
    static readonly MIN_SAT = 60;
    static readonly MAX_SAT = 100;
    static readonly SPAN_SAT = DriftColor.MAX_SAT - DriftColor.MIN_SAT;
    // static readonly MID_SAT = (DriftColor.MIN_SAT + DriftColor.MAX_SAT) / 2;

    static clamp_bright(b: number): number {
        return DriftColor.clamp(b, DriftColor.MIN_BRIGHT, DriftColor.MAX_BRIGHT);
    }
    static clamp_sat(s: number): number {
        return DriftColor.clamp(s, DriftColor.MIN_SAT, DriftColor.MAX_SAT);
    }

    static random(): DriftColor {
        return new DriftColor(
            new CieColor([
                // TODO even p across CIELUV for uniform perceptual distribution
                Math.random() * 360,
                Math.random() * (DriftColor.MAX_SAT - DriftColor.MIN_SAT)
                    + DriftColor.MIN_SAT,
                Math.random() * (DriftColor.MAX_BRIGHT - DriftColor.MIN_BRIGHT)
                    + DriftColor.MIN_BRIGHT,
            ]),
            Math.random()
        );
    }

    static clamp(x: number, min: number, max: number): number {
        return Math.max(min, Math.min(x, max));
    }

    constructor(readonly cie: CieColor, readonly key: number = Math.random()) {}

    drift(f: number) {
        return new DriftColor(
            new CieColor([
                (this.cie.hsl[0] + Math.random() * f),
                DriftColor.clamp_sat(this.cie.hsl[1] + Math.random() * f),
                DriftColor.clamp_bright(this.cie.hsl[2] + Math.random() * f),
            ]),
            this.key
        );
    }

    // shift a certain amount (mag) in a given direction (unit), in hsluv space.
    shift(unit: number[], mag: number): DriftColor {
        return new DriftColor(
            new CieColor([
                unit[0] * mag + this.cie.hsl[0],
                DriftColor.clamp_sat(unit[1] * mag + this.cie.hsl[1]),
                DriftColor.clamp_bright(unit[2] * mag + this.cie.hsl[2]),
            ]),
            this.key
        );
    }

    d2(that: DriftColor) {
        return this.perceptualDistance2(that);
    }

    // sum of squares distance using
    normalizedDistance2(that: DriftColor): number {
        return this.cie.normalizedDistance2(that.cie);
    }

    perceptualDistance2(that: DriftColor): number {
        return this.cie.perceptualDistance2(that.cie);
    }

    contrast(): DriftColor {
        const newCie = this.cie.contrast();
        return new DriftColor(
            new CieColor([
                newCie.hsl[0],
                DriftColor.MAX_SAT,
                newCie.hsl[2] > DriftColor.MID_BRIGHT
                    ? DriftColor.MIN_BRIGHT
                    : DriftColor.MAX_BRIGHT,
            ]),
            1 - this.key
        );
    }

    toHex(): string {
        return this.cie.hex();
    }

    toHsluvString() { return this.cie.toHsluvString(); }
    toLchString() { return this.cie.toLchString(); }
    // toHpluvString() { return this.cie.toHpluvString(); }

    toString(): string {
        return `${this.cie.hex()} - hsl: ${this.toHsluvString()} - lch: ${this.toLchString()}`;
    }
}
