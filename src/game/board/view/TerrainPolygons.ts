import {HEX_HALF_HEIGHT, HEX_LL_XY, HEX_LR_XY, HEX_RIGHT_XY, HEX_UL_XY, HEX_UR_XY} from './HexContants';
import {Tile} from '../model/Tile';
import {Map} from 'immutable';
import CartPair from '../../../common/CartPair';
import {Terrain} from '../model/Terrain';
import {DriftColor} from '../../../color/DriftColor';

// how much contrast to give for each line in a terrain's set of polygons
type Shader = (lineIndex: number, color: DriftColor) => DriftColor

const UNKNOWN_SHADER: Shader = (index, color) =>
    color.texture((index % 2 + 2) * 6) // faded

const terrainPolygons = Map<Terrain, string[]>().asMutable()
const terrainShaders = Map<Terrain, Shader>().asMutable()

const WALL_W = HEX_HALF_HEIGHT / 2  // half the width of the house body
const WALL_H = WALL_W * 9 / 13  // half the height of the house body
const ROOF_W = WALL_H  // eaves
const ROOF_H = WALL_W * 15 / 13  // attic
const Y_OFFSET = WALL_H * 0.6  // shift down
const y = Y_OFFSET
// const houseLL = new CartPair(-WALL_W, y + WALL_H)
// const houseLR = new CartPair(WALL_W, y + WALL_H)
terrainPolygons.set(Terrain.City, [
    // roof triangle
    ` ${-WALL_W - ROOF_W},${y - WALL_H} 0,${y - WALL_H - ROOF_H}`
    + ` ${WALL_W + ROOF_W},${y - WALL_H}`,
    // bottom rectangle — start bottom of left wall and go clockwise
    `${-WALL_W},${y + WALL_H} ${-WALL_W},${y - WALL_H}` // left wall
    + ` ${WALL_W},${y - WALL_H} ${WALL_W},${y + WALL_H}`, // right wall
    // door
    `${-WALL_W * .4},${y + WALL_H} ${-WALL_W * .4},${y - WALL_H * .6}`
    + ` ${WALL_W * .4},${y - WALL_H * .6} ${WALL_W * .4},${y + WALL_H}`,
])
const CITY_SHADER: Shader = (index, color) =>
    color.texture((index % 2 + 2) * 9)
terrainShaders.set(Terrain.City, CITY_SHADER)

// mtnLeft and mtnRight are points along the left and right lower segments
// of the hex, respectively.
const mtnLeft = HEX_LL_XY.plus(HEX_UL_XY.scale(0.5))
const mtnRight = HEX_LR_XY.plus(HEX_UR_XY.scale(0.7))
const mtnMidBottom = HEX_LL_XY.plus(HEX_RIGHT_XY.scale(0.1))
terrainPolygons.set(Terrain.Mountain, [
    // left mountain
    `${mtnLeft} ${HEX_LL_XY} ${mtnMidBottom} -0,0 -13,-11`,
    // right mountain
    `${mtnMidBottom} ${HEX_LR_XY} ${mtnRight} 8,-13 3,-15`,
])
terrainShaders.set(
    Terrain.Mountain, (index, color) =>
        color.texture((index % 2 + 2) * 10)
)

{ // castle
    const [ w, h, doorW, doorH ] = [ 9, 16, 2.5, 11 ]
    const [ crenH, flagH ] = [ 5, 20 ]
    const [ flagW, flagM ] = [ flagH * 0.7, flagH * 0.3 ]
    const dy = 4 // shift down

    const ur = new CartPair(w, -h + dy)
    const lr = new CartPair(w, h + dy)
    const ll = new CartPair(-w, h + dy)
    const ul = new CartPair(-w, -h + dy)

    const crenR = new CartPair(w * 0.4, 0)
    const crenD = new CartPair(0, crenH)
    const crenR1 = crenR.scale(1).plusX(+.4)
    const crenR2 = crenR.scale(2).plusX(-.5)
    const crenR3 = crenR.scale(3).plusX(+.5)
    const crenR4 = crenR.scale(4).plusX(-.4)

    const doorUR = new CartPair(doorW, h - doorH + dy)
    const doorLR = new CartPair(doorW, h + dy)
    const doorLL = new CartPair(-doorW, h + dy)
    const doorUL = new CartPair(-doorW, h - doorH + dy)

    const flagBase = ul.plus(ur).scale(.5).plusX(-flagW * .05)
    const flagBase2 = flagBase.plusX(flagW * .05)
    const flagRight = flagBase.plusXY(flagW, -flagH * 0.9)
    const flagTop = flagBase.plusY(-flagH)
    const flagMid = flagBase.plusXY(flagW * .05, -flagM)

    terrainPolygons.set(Terrain.Capital, [
        `${flagBase} ${flagTop} ${flagRight} ${flagMid} ${flagBase2}`,
        `${ur} ${lr} ${ll} ${ul}`
            + ` ${ul.plus(crenR1)} ${ul.plus(crenR1).plus(crenD)}`
            + ` ${ul.plus(crenR2).plus(crenD)} ${ul.plus(crenR2)}`
            + ` ${ul.plus(crenR3)} ${ul.plus(crenR3).plus(crenD)}`
            + ` ${ul.plus(crenR4).plus(crenD)} ${ul.plus(crenR4)}`,
        `${doorUL} ${doorLL} ${doorLR} ${doorUR}`,
    ])
    terrainShaders.set(Terrain.Capital, (index, color) =>
        (index === 0)
            ? color.texture(20)
            : color.contrast().texture((index % 2) * 9)
    )

    // TODO make a framework for lists of pairs that can be transformed en mass — convert to String in code?
    // captured --> without the flag, shorter ...
    // const dy2 = h * 0.125
    // const [ ul2, lr2, ll2, ur2 ] = [
    //     ul.plusY(dy2), lr.plusY(-dy2), ll.plusY(-dy2), ur.plusY(dy2) ]
    // const [ dUL2, dLL2, dLR2, dUR2 ] = [
    //     doorUL.plusY(-dy2), doorLL.plusY(-dy2),
    //     doorLR.plusY(-dy2), doorUR.plusY(-dy2) ]
    // const crenD2 = crenD.scale(0.7)
    // terrainPolygons.set(Terrain.CapturedCapital, [
    //     `${ur2} ${lr2} ${ll2} ${ul2}`
    //         + ` ${ul2.plus(crenR1)} ${ul2.plus(crenR1).plus(crenD2)}`
    //         + ` ${ul2.plus(crenR2).plus(crenD2)} ${ul2.plus(crenR2)}`
    //         + ` ${ul2.plus(crenR3)} ${ul2.plus(crenR3).plus(crenD2)}`
    //         + ` ${ul2.plus(crenR4).plus(crenD2)} ${ul2.plus(crenR4)}`,
    //     `${dUL2} ${dLL2} ${dLR2} ${dUR2}`,
    // ])
    // // ... & muted
    // terrainShaders.set(Terrain.CapturedCapital, UNKNOWN_SHADER)
    terrainPolygons.set(
        Terrain.CapturedCapital,
        terrainPolygons.get(Terrain.Capital).slice(1,3) // remove flag
    )
    terrainShaders.set(Terrain.CapturedCapital, CITY_SHADER)
}

export const getTerrainPolygons = (tile: Tile): string[] | undefined =>
    terrainPolygons.get(tile.terrain)

export const getTerrainShader = (tile: Tile) =>
    tile.known
        ? terrainShaders.get(tile.terrain, CITY_SHADER)
        : UNKNOWN_SHADER