// hex is 52 tall (middle section is 26 tall) and 60 wide
// assume centered at 0, 0

// corners starting at lower left and going clockwise are:
// (-30, -13) (-30, 13) (0, 26) (30, 13) (30, -13) (0, -26)

const WALL_W = 11 // half the width of the house body
const WALL_H = 10 // half the height of the house body
const ROOF_W = 10 // eaves
const ROOF_H = 15 // attic
const Y_OFFSET = 5 // shift

export const cityPoints = (x: number, y: number) => {
    const y1 = y + Y_OFFSET
    return `${x - WALL_W},${y1 + WALL_H} ${x - WALL_W},${y1 - WALL_H}` // left wall
        + ` ${x - WALL_W - ROOF_W},${y1 - WALL_H} ${x},${y1 - WALL_H - ROOF_H}`
        + ` ${x + WALL_W + ROOF_W},${y1 - WALL_H}` // roof
        + ` ${x + WALL_W},${y1 - WALL_H} ${x + WALL_W},${y1 + WALL_H}` // left wall
}
