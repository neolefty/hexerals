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

    static readonly BLACK: DriftColor = new DriftColor(CieColor.BLACK);
    static readonly GREY_20: DriftColor = new DriftColor(CieColor.GREY_20);
    static readonly GREY_40: DriftColor = new DriftColor(CieColor.GREY_40);
    static readonly GREY_60: DriftColor = new DriftColor(CieColor.GREY_60);
    static readonly GREY_80: DriftColor = new DriftColor(CieColor.GREY_80);
    static readonly WHITE: DriftColor = new DriftColor(CieColor.WHITE);

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
                Math.random() * (this.SPAN_SAT) + DriftColor.MIN_SAT,
                Math.random() * (this.SPAN_BRIGHT) + DriftColor.MIN_BRIGHT,
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
                        ? DriftColor.MIN_BRIGHT + 5 // allow more color
                        : DriftColor.MAX_BRIGHT,
                ]),
                1 - this.key
            )
        return this._contrast
    }

    get hue() { return this.cie.hue }
    get saturation() { return this.cie.saturation }
    get lightness() { return this.cie.lightness }

    // tslint:disable-next-line:member-ordering
    private lightCache: Map<number, DriftColor> = new Map()

    darker = (diff: number = 20): DriftColor =>
        this.withLightness(Math.max(0, this.lightness - diff))

    lighter = (diff: number = 20): DriftColor =>
        this.withLightness(Math.min(100, this.lightness + diff))

    withLightness = (lightness: number): DriftColor => {
        if (!this.lightCache.has(lightness))
            this.lightCache.set(lightness, new DriftColor(
                this.cie.withLightness(lightness),
                this.key * (lightness / 100)
            ))
        return this.lightCache.get(lightness) as DriftColor
    }

    // A color with same hue & sat, but slightly lighter or darker, for texture
    texture = (diff: number = 20): DriftColor => {
        // lightness 0-25 -- return brighter (too dark to get darker)
        //   - 25-50 -- darker
        //   - 50-75 -- brighter
        //   - 75-100 -- darker (too bright to get brighter)
        const darker: boolean = (
            this.lightness > diff - 5
            && this.lightness < DriftColor.MID_LIGHT
        ) || this.lightness > (95 - diff)
        return darker ? this.darker(diff) : this.lighter(diff)
    }

    toHexString = () => this.cie.toHexString()
    toHslString = () => this.cie.toHslString()
    toLchString = () => this.cie.toLchString()

    toString(): string {
        return `${this.cie.toHexString()} - hsl: ${this.toHslString()} - lch: ${this.toLchString()}`
    }
}
