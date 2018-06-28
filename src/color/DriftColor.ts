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

    d2(that: DriftColor) {
        return this.cie.perceptualDistance2(that.cie);
    }

    drift(f: number) {
        return new DriftColor(
            new CieColor([
                (this.cie.hp[0] + Math.random() * f),
                DriftColor.clamp_sat(this.cie.hp[1] + Math.random() * f),
                DriftColor.clamp_bright(this.cie.hp[2] + Math.random() * f),
            ]),
            this.key
        );
    }

    // shift a certain amount (mag) in a given direction (unit), in hsluv space.
    shift(unit: number[], mag: number): DriftColor {
        return new DriftColor(
            new CieColor([
                unit[0] * mag + this.cie.hs[0],
                DriftColor.clamp_sat(unit[1] * mag + this.cie.hs[1]),
                DriftColor.clamp_bright(unit[2] * mag + this.cie.hs[2]),
            ]),
            this.key
        );
    }

    perceptualDistance(that: DriftColor): number {
        return this.cie.perceptualDistance2(that.cie);
    }

    contrast(): DriftColor {
        const newCie = this.cie.contrast();
        return new DriftColor(
            new CieColor([
                newCie.hs[0],
                DriftColor.MAX_SAT,
                newCie.hs[2] > DriftColor.MID_BRIGHT
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
    toHpluvString() { return this.cie.toHpluvString(); }

    toString(): string {
        return `${this.cie.hex()} - hs: ${this.toHsluvString()} - hp: ${this.toHpluvString()}`;
    }
}
