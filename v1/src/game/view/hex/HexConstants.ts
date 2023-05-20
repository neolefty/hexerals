// 13 & 15 make a good integer approximation of a hexagon
// 15 * sqrt(3) / 2 = 12.9904

// hex is 52 tall and 60 wide, centered at 0, 0
// corners starting at upper left and going counterclockwise are:
// (-15, -26) (-30, 0) (-15, 26) (15, 26) (30, 0) (15, -26)

import {CartPair} from '../../../common/CartPair';

export const HEX_RADIUS = 30
export const HEX_WIDTH = 2 * HEX_RADIUS
export const HEX_HALF_HEIGHT = 26
export const HEX_QUARTER_HEIGHT = 0.5 * HEX_HALF_HEIGHT
// approx (sqrt 3) / 2
export const HALF_HEIGHT_RATIO = HEX_HALF_HEIGHT / HEX_RADIUS
export const HEX_MID = HEX_RADIUS * 0.5
export const HEX_COLUMN = 3 * HEX_MID

// How wide would this many flat-top hex columns be?
// Horizontally, hex centers are 3 radii apart, and they overlap one radius.
export const hexPixelWidth = (hexes: number) =>
    // radius * 1.5 * hexes + radius * .5 = (3 * hexes + 1) * 0.5 * radius
    (hexes * HEX_COLUMN) + HEX_MID

// How high would this many flat-top hex rows be?
// Hexes rows overlap 50% vertically.
export const hexPixelHeight = (hexes: number) =>
    (hexes + 1) * HEX_HALF_HEIGHT

// how many columns fit in this many pixels, horizontally?
export const hexesWide = (pixels: number, hexRadius: number) =>
    // inverse of hexPixelWidth
    0.33333 * ((2 * pixels / hexRadius) - 1)

// how many rows fit in this many pixels, vertically?
export const hexesTall = (pixels: number, hexRadius: number) =>
    (pixels / (hexRadius * HALF_HEIGHT_RATIO)) - 1

// what would be the hex radius if there were this many rows?
export const radiusFromRowCount = (
    pixelsHigh: number, rows: number
) => pixelsHigh / ((rows + 1) * HALF_HEIGHT_RATIO)

// what would be the hex radius if there were this many columns?
export const radiusFromColumnCount = (
    pixelsWide: number, columns: number
) => 2 * pixelsWide / (3 * columns + 1)

// for a given number of rows, how many columns fit, proportionately?
export const widthFromHeight = (
    displaySize: CartPair, nHexesTall: number
): number =>
    Math.round(hexesWide(
        displaySize.x,
        radiusFromRowCount(displaySize.y, nHexesTall)))

// for a given number of columns, how many rows fit, proportionately?
export const heightFromWidth = (
    displaySize: CartPair, nHexesWide: number
): number =>
    Math.round(hexesTall(
        displaySize.y,
        radiusFromColumnCount(displaySize.x, nHexesWide)))

export const countHexes = (w: number, h: number) =>
    // even heights: 1 full zig-zaggy row for every 2 height —> w * h / 2
    // odd heights:
    //   - even width: 1 perforated half-row for every height —> (w / 2) * h
    //   - odd width: 1 more long half-row than short, so round up
    Math.ceil(w * h * .5)


export const HEX_LEFT = -HEX_RADIUS
export const HEX_RIGHT = HEX_RADIUS
export const HEX_TOP = -HEX_HALF_HEIGHT
export const HEX_BOTTOM = HEX_HALF_HEIGHT
export const HEX_MID_LEFT = HEX_LEFT / 2
export const HEX_MID_RIGHT = HEX_RIGHT / 2

export const HEX_UL_XY = new CartPair(HEX_MID_LEFT, HEX_TOP)
export const HEX_LEFT_XY = new CartPair(HEX_LEFT, 0)
export const HEX_LL_XY = new CartPair(HEX_MID_LEFT, HEX_BOTTOM)
export const HEX_UR_XY = new CartPair(HEX_MID_RIGHT, HEX_TOP)
export const HEX_RIGHT_XY = new CartPair(HEX_RIGHT, 0)
export const HEX_LR_XY = new CartPair(HEX_MID_RIGHT, HEX_BOTTOM)

// TODO convert to CartPair / CartChain
const hexPoints = (x: number, y: number) => {
    return ''
        + (x - HEX_RADIUS) + ',' + y + ' ' // left
        + (x - HEX_MID) + ',' + (y - HEX_HALF_HEIGHT) + ' ' // up left
        + (x + HEX_MID) + ',' + (y - HEX_HALF_HEIGHT) + ' ' // up right
        + (x + HEX_RADIUS) + ',' + y + ' ' // right
        + (x + HEX_MID) + ',' + (y + HEX_HALF_HEIGHT) + ' ' // down right
        + (x - HEX_MID) + ',' + (y + HEX_HALF_HEIGHT) // down left
}

// hex centered at (0, 0)
export const HEX_POINTS = hexPoints(0, 0)
