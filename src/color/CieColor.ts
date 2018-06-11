import * as hsluv from 'hsluv';

export class CieColor {
    readonly hp: number[];

    constructor(readonly hs: number[]) {
        // positive modulo
        this.hs[0] = ((this.hs[0] % 360) + 360) % 360;
        this.hp = hsluv.rgbToHpluv(hsluv.hsluvToRgb(this.hs));
    }

    // TODO reduce perceptual distance between dark blue & green
    perceptualDistance2(that: CieColor) {
        const dHueRaw = Math.abs(this.hp[0] - that.hp[0]),
            dSat = this.hs[1] - that.hs[1],
            dBright = this.hs[2] - that.hs[2];
        const dHue = dHueRaw < 180 ? dHueRaw : dHueRaw - 360;
        return dHue * dHue + dSat * dSat + dBright * dBright;
    }

    perceptualDistanceHp2(that: CieColor) {
        const dHueRaw = Math.abs(this.hp[0] - that.hp[0]),
            dSat = this.hp[1] - that.hp[1],
            dBright = this.hp[2] - that.hp[2];
        const dHue = dHueRaw < 180 ? dHueRaw : dHueRaw - 360;
        return dHue * dHue + dSat * dSat + dBright * dBright;
    }

    hex() {
        return hsluv.hsluvToHex(this.hs);
    }

    contrast(): CieColor {
        return new CieColor([
            this.hs[0] + 180,
            this.hs[1],
            this.hs[2]
        ]);
    }

    roundNumArrayToString(ns: number[]): string {
        return `${Math.round(ns[0])}`
            + ` ${Math.round(ns[1])}`
            + ` ${Math.round(ns[2])}`;

    }

    toHsluvString(): string { return this.roundNumArrayToString(this.hs); }
    toHpluvString(): string { return this.roundNumArrayToString(this.hp); }
}