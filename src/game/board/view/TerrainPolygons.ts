import {HEX_HALF_HEIGHT, HEX_LL_XY, HEX_LR_XY, HEX_RIGHT_XY, HEX_UL_XY, HEX_UR_XY} from './HexConstants';
import {Tile} from '../model/Tile';
import {Map} from 'immutable';
import {CartPair, CartChain} from '../../../common/CartPair';
import {Terrain} from '../model/Terrain';
import {DriftColor} from '../../../color/DriftColor';

// how much contrast to give for each line in a terrain's set of polygons
type Shader = (lineIndex: number, color: DriftColor) => DriftColor

const UNKNOWN_SHADER: Shader = (index, color) =>
    color.texture((index % 2 + 2) * 6) // faded
const CITY_SHADER: Shader = (index, color) =>
    color.texture((index % 2 + 2) * 9)

const terrainPolygons = Map<Terrain, string[]>().asMutable()
const terrainShaders = Map<Terrain, Shader>().asMutable()
const unknownShaders = Map<Terrain, Shader>().asMutable()

{ // city (house)
    const WALL_W = HEX_HALF_HEIGHT / 2  // half the width of the house body
    const WALL_H = WALL_W * 9 / 13  // half the height of the house body
    const ROOF_W = WALL_H  // eaves
    const ROOF_H = WALL_W * 15 / 13  // attic
    const DOOR_HEIGHT = 0.65 // fraction of house
    const DOOR_WIDTH = 0.25

    const ll = new CartPair(-WALL_W, WALL_H)
    const ul = new CartPair(-WALL_W, -WALL_H)
    const ur = new CartPair(WALL_W, -WALL_H)
    const lr = new CartPair(WALL_W, WALL_H)

    const peak = new CartPair(0, -WALL_H - ROOF_H)
    const roofL = new CartPair(-WALL_W - ROOF_W, -WALL_H)
    const roofR = roofL.scaleXY(-1, 1)

    const rect = CartChain.construct(ll, ul, ur, lr)
    const door = rect.scaleXY(DOOR_WIDTH, DOOR_HEIGHT)
        .plusXY(0, (1 - DOOR_HEIGHT) * WALL_H)
    const roof = CartChain.construct(roofL, peak, roofR)

    const Y_OFFSET = WALL_H * 0.6  // shift down
    terrainPolygons.set(Terrain.City, [
        roof.plusXY(0, Y_OFFSET).toString(),
        rect.plusXY(0, Y_OFFSET).toString(),
        door.plusXY(0, Y_OFFSET).toString(),
    ])
    terrainShaders.set(Terrain.City, CITY_SHADER)
}

{ // mountains
    // mtnLeft and mtnRight are points along the left and right lower segments of the hex, respectively.
    const footLeft = HEX_LL_XY.plus(HEX_UL_XY.scale(0.5))
    const footRight = HEX_LR_XY.plus(HEX_UR_XY.scale(0.7))
    const footMid = HEX_LL_XY.plus(HEX_RIGHT_XY.scale(0.1))
    const peakLeft = new CartPair(-13, -11)
    const peakRightL = new CartPair(3, -15)
    const peakRightR = new CartPair(8, -13)
    const ctr = new CartPair(0, 0)
    const mtnLeft = CartChain.construct(
        footLeft, HEX_LL_XY, footMid, ctr, peakLeft)
    const mtnRight = CartChain.construct(
        footMid, HEX_LR_XY, footRight, peakRightR, peakRightL)

    const slopeRL = footMid.minus(peakRightL)
    const slopeRR = footRight.minus(peakRightR)
    const snowRL = peakRightL.plus(slopeRL.scale(0.24))
    const snowRR = peakRightR.plus(slopeRR.scale(0.35))
    const snowMidR = snowRL.plus(snowRR).scale(0.5).plusY(-1)
    const mtnSnowR = CartChain.construct(
        peakRightL, peakRightR, snowRR, snowMidR, snowRL)

    const slopeLL = footLeft.minus(peakLeft)
    const slopeLR = ctr.minus(peakLeft)
    const snowLL = peakLeft.plus(slopeLL.scale(0.45))
    const snowLR = peakLeft.plus(slopeLR.scale(0.8))
    const snowMidL = snowLL.plus(snowLR).scale(0.5).plusY(-1.5)
    const mtnSnowL = CartChain.construct(
        peakLeft, snowLL, snowMidL, snowLR)

    terrainPolygons.set(Terrain.Mountain, [
        mtnLeft.toString(),
        mtnSnowL.toString(),
        mtnRight.toString(),
        mtnSnowR.toString(),
    ])
    terrainShaders.set(
        Terrain.Mountain, (index, color) =>
            color.darker([15, -10, 25, -20][index])
    )
    unknownShaders.set(
        Terrain.Mountain, (index, color) =>
            color.darker([10, -5, 20, -10][index])
    )
}

{ // castle
    const [ w, h, doorW, doorH ] = [ 9, 16, 2.5, 11 ]
    const [ crenH, flagH ] = [ 5, 19 ]
    const [ flagW, flagM ] = [ flagH * 0.7, flagH * 0.3 ]
    const dy = 4 // shift down

    const ur = new CartPair(w, -h + dy)
    const lr = new CartPair(w, h + dy)
    const ll = new CartPair(-w, h + dy)
    const ul = new CartPair(-w, -h + dy)

    // crenelations
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

    const [ flag, building, door ] = [
        CartChain.construct(flagBase, flagTop, flagRight, flagMid, flagBase2),
        CartChain.construct(
            ur, lr, ll, ul,
            ul.plus(crenR1), ul.plus(crenR1).plus(crenD),
            ul.plus(crenR2).plus(crenD), ul.plus(crenR2),
            ul.plus(crenR3), ul.plus(crenR3).plus(crenD),
            ul.plus(crenR4).plus(crenD), ul.plus(crenR4),
        ),
        CartChain.construct(doorUL, doorLL, doorLR, doorUR),
    ]

    terrainPolygons.set(Terrain.Capital, [
        flag.toString(), building.toString(), door.toString()])
    terrainShaders.set(Terrain.Capital, (index, color) =>
        (index === 0)
            ? color.contrast()
            : CITY_SHADER(index - 1, color)
    )

    // Captured: shorter ...
    const cap = (chain: CartChain) =>
        chain.scaleXY(1, 0.8).plusXY(0, h * -0.25)
    terrainPolygons.set(Terrain.CapturedCapital, [
        cap(building).toString(),
        cap(door).toString(),
    ])
    // ... & muted
    terrainShaders.set(Terrain.CapturedCapital, UNKNOWN_SHADER)
}

export const getTerrainPolygons = (tile: Tile): string[] | undefined =>
    terrainPolygons.get(tile.terrain)

export const getTerrainShader = (tile: Tile) => {
    return tile.known
        ? terrainShaders.get(tile.terrain, CITY_SHADER)
        : unknownShaders.get(tile.terrain, UNKNOWN_SHADER)
}
