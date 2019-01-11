// 13 & 15 make a good integer approximation of a hexagon
// 15 * sqrt(3) / 2 = 12.9904

// hex is 52 tall and 60 wide, centered at 0, 0
// corners starting at upper left and going counterclockwise are:
// (-15, -26) (-30, 0) (-15, 26) (15, 26) (30, 0) (15, -26)

import {CartPair} from '../../../common/CartPair';

export const HEX_RADIUS = 30
export const HEX_MID = HEX_RADIUS * 0.5
export const HEX_HALF_HEIGHT = 26
export const HEX_ROW = HEX_HALF_HEIGHT * 2
export const HEX_COLUMN = 3 * HEX_MID
export const HEX_HEIGHT = HEX_HALF_HEIGHT * 2

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
