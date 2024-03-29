import { CieColor } from "./CieColor"
import { minMax } from "../common/MathFunctions"
import { Map } from "immutable"
import { ThreeD } from "../common/FixedLengthArrays"

export class DriftColor {
    // allowed limits on lightness & saturation when drifting (hsluv)
    static readonly MIN_BRIGHT = 30
    static readonly MAX_BRIGHT = 80
    static readonly SPAN_BRIGHT = DriftColor.MAX_BRIGHT - DriftColor.MIN_BRIGHT
    static readonly RECIP_BRIGHT = 1 / DriftColor.SPAN_BRIGHT
    static readonly MID_LIGHT =
        (DriftColor.MIN_BRIGHT + DriftColor.MAX_BRIGHT) / 2
    static readonly MIN_SAT = 60
    static readonly MAX_SAT = 100
    static readonly SPAN_SAT = DriftColor.MAX_SAT - DriftColor.MIN_SAT
    // static readonly MID_SAT = (DriftColor.MIN_SAT + DriftColor.MAX_SAT) / 2

    static readonly BLACK: DriftColor = new DriftColor(CieColor.BLACK)
    static readonly GREY_20: DriftColor = new DriftColor(CieColor.GREY_20)
    static readonly GREY_30: DriftColor = new DriftColor(CieColor.GREY_30)
    static readonly GREY_40: DriftColor = new DriftColor(CieColor.GREY_40)
    static readonly GREY_50: DriftColor = new DriftColor(CieColor.GREY_50)
    static readonly GREY_60: DriftColor = new DriftColor(CieColor.GREY_60)
    static readonly GREY_70: DriftColor = new DriftColor(CieColor.GREY_70)
    static readonly GREY_80: DriftColor = new DriftColor(CieColor.GREY_80)
    static readonly WHITE: DriftColor = new DriftColor(CieColor.WHITE)

    static clamp_bright(b: number): number {
        return DriftColor.clamp(b, DriftColor.MIN_BRIGHT, DriftColor.MAX_BRIGHT)
    }
    static clamp_sat(s: number): number {
        return DriftColor.clamp(s, DriftColor.MIN_SAT, DriftColor.MAX_SAT)
    }

    static random(): DriftColor {
        return DriftColor.constructHSL(
            // TODO even p across CIELUV for uniform perceptual distribution
            Math.random() * 360,
            Math.random() * this.SPAN_SAT + DriftColor.MIN_SAT,
            Math.random() * this.SPAN_BRIGHT + DriftColor.MIN_BRIGHT
        )
    }

    static clamp(x: number, min: number, max: number): number {
        return Math.max(min, Math.min(x, max))
    }

    static constructHSL(h: number, s: number, l: number) {
        return new DriftColor(new CieColor([h, s, l]), Math.random())
    }

    constructor(readonly cie: CieColor, readonly key: number = Math.random()) {}

    drift(f: number) {
        return new DriftColor(
            new CieColor([
                this.cie.hsl[0] + Math.random() * f,
                DriftColor.clamp_sat(this.cie.hsl[1] + Math.random() * f),
                DriftColor.clamp_bright(this.cie.hsl[2] + Math.random() * f),
            ]),
            this.key
        )
    }

    // shift a certain amount (mag) in a given direction (unit), in hsluv space.
    shift(unit: ThreeD, mag: number): DriftColor {
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
        return this.perceptualD2(that)
    }

    // sum of squares distance using HSL
    hslD2(that: DriftColor): number {
        return this.cie.hslDistance2(that.cie)
    }

    // sum of squares distance using CIE LCH
    perceptualD2(that: DriftColor): number {
        return this.cie.perceptualDistance2(that.cie)
    }

    // tslint:disable-next-line:member-ordering
    private _contrast: DriftColor | undefined = undefined
    // A color with the opposite hue and maximum saturation
    contrast(): DriftColor {
        if (!this._contrast) {
            const hsl: ThreeD =
                this.saturation > 10 // if it's not too grey, pop up the saturation
                    ? [
                          this.cie.hsl[0] + 180,
                          DriftColor.MAX_SAT,
                          this.cie.hsl[2] > DriftColor.MID_LIGHT
                              ? DriftColor.MIN_BRIGHT + 5 /* allow more color*/
                              : DriftColor.MAX_BRIGHT,
                      ]
                    : [
                          // if it's very close to grey, make it dark or light grey
                          this.cie.hsl[0] + 180,
                          0,
                          this.cie.hsl[2] > DriftColor.MID_LIGHT
                              ? DriftColor.MIN_BRIGHT - 5
                              : DriftColor.MAX_BRIGHT + 5,
                      ]
            this._contrast = new DriftColor(new CieColor(hsl), 1 - this.key)
        }
        return this._contrast
    }

    get hue() {
        return this.cie.hue
    }
    get saturation() {
        return this.cie.saturation
    }
    get lightness() {
        return this.cie.lightness
    }

    get hexString() {
        return this.cie.hexString
    }
    get hslString() {
        return this.cie.hslString
    }
    get lchString() {
        return this.cie.lchString
    }

    // tslint:disable-next-line:member-ordering
    private lightCache = Map<number, DriftColor>().asMutable()

    darker = (diff = 20): DriftColor =>
        this.withLightness(this.lightness - diff)

    lighter = (diff = 20): DriftColor =>
        this.withLightness(this.lightness + diff)

    withLightness = (lightness: number): DriftColor => {
        lightness = minMax(lightness, 0, 100)
        if (!this.lightCache.has(lightness))
            this.lightCache.set(
                lightness,
                new DriftColor(
                    this.cie.withLightness(lightness),
                    this.key * (lightness / 100)
                )
            )
        return this.lightCache.get(lightness) as DriftColor
    }

    // A color with same hue & sat, but slightly lighter or darker, for texture
    texture(diff = 20): DriftColor {
        // lightness 0-25 -- return brighter (too dark to get darker)
        //   - 25-50 -- darker
        //   - 50-75 -- brighter
        //   - 75-100 -- darker (too bright to get brighter)
        const darker: boolean =
            (this.lightness > diff - 5 &&
                this.lightness < DriftColor.MID_LIGHT) ||
            this.lightness > 95 - diff
        return darker ? this.darker(diff) : this.lighter(diff)
    }

    toString(): string {
        return `${this.hexString} - hsl: ${this.hslString} - lch: ${this.lchString}`
    }

    equals(that: unknown): boolean {
        if (!that) return false
        const thatDrift = that as DriftColor
        const thatHsl = thatDrift.cie?.hsl
        return (
            Array.isArray(thatHsl) &&
            thatHsl.length === 3 &&
            thatHsl[0] === this.cie.hsl[0] &&
            thatHsl[1] === this.cie.hsl[1] &&
            thatHsl[2] === this.cie.hsl[2]
        )
    }
}
