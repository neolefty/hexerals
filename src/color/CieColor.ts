import * as hsluv from 'hsluv'

const roundNumArrayToString = (ns: number[]): string =>
    `${Math.round(ns[0])} ${Math.round(ns[1])} ${Math.round(ns[2])}`

export class CieColor {
    // for descriptions of color spaces, see http://www.hsluv.org/comparison/
    static readonly BLACK: CieColor = new CieColor([0, 0, 0])
    static readonly GREY_20: CieColor = new CieColor([0, 0, 20])
    static readonly GREY_40: CieColor = new CieColor([0, 0, 40])
    static readonly GREY_60: CieColor = new CieColor([0, 0, 60])
    static readonly GREY_80: CieColor = new CieColor([0, 0, 80])
    static readonly WHITE: CieColor = new CieColor([0, 0, 100])

    // readonly hpl: number[]  // pastels only, with uniformity and full range

    // perceptually normalized, but not all hues have full saturation range
    // -- good for computing perceptual distance
    readonly lch: number[]

    // hsl is computer-standard hue/saturation/lightness
    private static d2Hsl(a: number[], b: number[]) {
        const dHueRaw = Math.abs(a[0] - b[0]),
            dSat = a[1] - b[1],
            dBright = a[2] - b[2]
        const dHue = dHueRaw < 180 ? dHueRaw : 360 - dHueRaw
        return dHue * dHue + dSat * dSat + dBright * dBright
    }

    constructor(readonly hsl: number[]) {
        // positive modulo
        this.hsl[0] = ((this.hsl[0] % 360) + 360) % 360
        const rgb = hsluv.hsluvToRgb(this.hsl)
        // this.hpl = hsluv.rgbToHpluv(rgb)
        this.lch = hsluv.rgbToLch(rgb)
    }

    hslDistance2(that: CieColor) {
        return CieColor.d2Hsl(this.hsl, that.hsl)
    }

    perceptualDistance2(that: CieColor) {
        const [
            light1, light2, // lightness
            chroma1, chroma2, // saturation
            hue1, hue2,
        ] = [
            this.lch[0], that.lch[0],
            this.lch[1], that.lch[1],
            this.lch[2], that.lch[2],
        ]

        const dHueRaw = Math.abs(hue1 - hue2),
            dSat = chroma1 - chroma2,
            dLight = light1 - light2
        const dHue = dHueRaw < 180 ? dHueRaw : 360 - dHueRaw
        // attempt to compensate for low lightness / saturation
        // -- hue that is dark or desaturated is less important
        const result = dHue * dHue * chroma1 * chroma2 * light1 * light2
            + dSat * dSat * 1e8 * 0.4  // de-emphasize saturation
            + dLight * dLight * 1e8
        // console.log(`${result.toFixed(2)} -- delta ${[dBright.toFixed(2), dSat.toFixed(2), dHueRaw.toFixed(2)]} --from-- ${this.toLchString()} -to- ${that.toLchString()} = `)
        return result / 1e8
        // return CieColor.d2(this.lch, that.lch)
    }

    private _hexString?: string = undefined
    toHexString = (): string => {
        if (this._hexString === undefined)
            this._hexString = hsluv.hsluvToHex(this.hsl)
        return this._hexString as string
    }
    toHslString = () => roundNumArrayToString(this.hsl)
    toLchString = () => roundNumArrayToString(this.lch)

    get hue() { return this.hsl[0] }
    get saturation() { return this.hsl[1] }
    get lightness() { return this.hsl[2] }

    darker = (diff: number) =>
        this.withLightness(Math.max(0, this.lightness - diff))

    lighter = (diff: number) =>
        this.withLightness(Math.min(100, this.lightness + diff))

    withLightness = (light: number) =>
        new CieColor([this.hsl[0], this.hsl[1], light])

    toString(): string {
        return this.toHexString()
    }
}