import * as hsluv from 'hsluv';

export class CieColor {
    // readonly hpl: number[];  // pastels only, with uniformity and full range
    readonly lch: number[];  // perceptually normalized, but only partial range
    // hsl is lightness-stretched version of lch, good for generating colors

    private static d2(a: number[], b: number[]) {
        const dHueRaw = Math.abs(a[0] - b[0]),
            dSat = a[1] - b[1],
            dBright = a[2] - b[2];
        const dHue = dHueRaw < 180 ? dHueRaw : 360 - dHueRaw;
        const result = dHue * dHue + dSat * dSat + dBright * dBright;
        // console.log(`${result} -- ${a} to ${b} = ${[dHueRaw, dSat, dBright]}`);
        return result;
    }

    constructor(readonly hsl: number[]) {
        // positive modulo
        this.hsl[0] = ((this.hsl[0] % 360) + 360) % 360;
        const rgb = hsluv.hsluvToRgb(this.hsl);
        // this.hpl = hsluv.rgbToHpluv(rgb);
        this.lch = hsluv.rgbToLch(rgb);
    }

    normalizedDistance2(that: CieColor) {
        return CieColor.d2(this.hsl, that.hsl);
    }

    // TODO reduce perceptual distance between dark blue & green
    perceptualDistance2(that: CieColor) {
        const dHueRaw = Math.abs(this.lch[2] - that.lch[2]),
            dSat = this.lch[1] - that.lch[1],
            dBright = this.lch[0] - that.lch[0];
        const dHue = dHueRaw < 180 ? dHueRaw : 360 - dHueRaw;
        const result = dHue * dHue + dSat * dSat + dBright * dBright;
        // console.log(`${result.toFixed(2)} -- delta ${[dBright.toFixed(2), dSat.toFixed(2), dHueRaw.toFixed(2)]} --from-- ${this.toLchString()} -to- ${that.toLchString()} = `);
        return result;
        // return CieColor.d2(this.lch, that.lch);
    }

    hex() {
        return hsluv.hsluvToHex(this.hsl);
    }

    contrast(): CieColor {
        return new CieColor([
            this.hsl[0] + 180,
            this.hsl[1],
            this.hsl[2]
        ]);
    }

    roundNumArrayToString(ns: number[]): string {
        return `${Math.round(ns[0])}`
            + ` ${Math.round(ns[1])}`
            + ` ${Math.round(ns[2])}`;

    }

    toHsluvString(): string { return this.roundNumArrayToString(this.hsl); }
    toLchString(): string { return this.roundNumArrayToString(this.lch); }
    // toHpluvString(): string { return this.roundNumArrayToString(this.hpl); }
}