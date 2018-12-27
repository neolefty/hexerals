import {CieColor} from './CieColor'

export class DriftColor {
    // allowed limits on lightness & saturation when drifting (hsluv)
    static readonly MIN_BRIGHT = 30
    static readonly MAX_BRIGHT = 80
    static readonly SPAN_BRIGHT = DriftColor.MAX_BRIGHT - DriftColor.MIN_BRIGHT
    static readonly RECIP_BRIGHT = 1 / DriftColor.SPAN_BRIGHT
    static readonly MID_LIGHT = (DriftColor.MIN_BRIGHT + DriftColor.MAX_BRIGHT) / 2
    static readonly MIN_SAT = 60
    static readonly MAX_SAT = 100
    static readonly SPAN_SAT = DriftColor.MAX_SAT - DriftColor.MIN_SAT
    // static readonly MID_SAT = (DriftColor.MIN_SAT + DriftColor.MAX_SAT) / 2

    static readonly WHITE: DriftColor = new DriftColor(CieColor.WHITE);
    static readonly GREY_10: DriftColor = new DriftColor(CieColor.GREY_10);
    static readonly GREY_20: DriftColor = new DriftColor(CieColor.GREY_20);
    static readonly GREY_40: DriftColor = new DriftColor(CieColor.GREY_40);
    static readonly GREY_60: DriftColor = new DriftColor(CieColor.GREY_60);
    static readonly BLACK: DriftColor = new DriftColor(CieColor.BLACK);

    static clamp_bright(b: number): number {
        return DriftColor.clamp(b, DriftColor.MIN_BRIGHT, DriftColor.MAX_BRIGHT)
    }
    static clamp_sat(s: number): number {
        return DriftColor.clamp(s, DriftColor.MIN_SAT, DriftColor.MAX_SAT)
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
        )
    }

    static clamp(x: number, min: number, max: number): number {
        return Math.max(min, Math.min(x, max))
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
        )
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
        )
    }

    d2(that: DriftColor) {
        return this.perceptualDistance2(that)
    }

    // sum of squares distance using
    normalizedDistance2(that: DriftColor): number {
        return this.cie.normalizedDistance2(that.cie)
    }

    perceptualDistance2(that: DriftColor): number {
        return this.cie.perceptualDistance2(that.cie)
    }

    // tslint:disable-next-line:member-ordering
    private _contrast: DriftColor | undefined = undefined
    // A color with the opposite hue and maximum saturation
    contrast(): DriftColor {
        if (!this._contrast)
            this._contrast = new DriftColor(
                new CieColor([
                    this.cie.hsl[0] + 180,
                    DriftColor.MAX_SAT,
                    this.cie.hsl[2] > DriftColor.MID_LIGHT
                        ? DriftColor.MIN_BRIGHT
                        : DriftColor.MAX_BRIGHT,
                ]),
                1 - this.key
            )
        return this._contrast
    }

    get hue() { return this.cie.hsl[0] }
    get saturation() { return this.cie.hsl[1] }
    get lightness() { return this.cie.hsl[2] }

    // tslint:disable-next-line:member-ordering
    private textureCache: Map<number, DriftColor> = new Map()

    // A color with same hue & sat, but slightly lighter or darker, for texture
    texture(diff: number = 20): DriftColor {
        if (!this.textureCache.has(diff)) {
            // lightness 0-25 -- return brighter (too dark to get darker)
            //   - 25-50 -- darker
            //   - 50-75 -- brighter
            //   - 75-100 -- darker (too bright to get brighter)
            const darker: boolean = (
                this.lightness > diff - 5
                && this.lightness < DriftColor.MID_LIGHT
            ) || this.lightness > (95 - diff)
            this.textureCache.set(diff, new DriftColor(
                new CieColor([
                    this.cie.hsl[0],
                    this.cie.hsl[1],
                    darker ? this.cie.hsl[2] - diff : this.cie.hsl[2] + diff,
                ]),
                this.key * (1 + diff / 100)
            ))
        }
        return this.textureCache.get(diff) as DriftColor
    }

    toHexString(): string { return this.cie.toHexString() }
    toHslString() { return this.cie.toHslString() }
    toLchString() { return this.cie.toLchString() }

    toString(): string {
        return `${this.cie.toHexString()} - hsl: ${this.toHslString()} - cie: ${this.toLchString()}`
    }
}
