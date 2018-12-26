import * as React from 'react';

import {DriftColor} from '../../../color/DriftColor';
import {Terrain} from '../model/Tile';
import {HEX_HALF_HEIGHT, HEX_LL_XY, HEX_LR_XY, HEX_RIGHT_XY, HEX_UL_XY, HEX_UR_XY} from './HexContants';
import {Map} from 'immutable';

// how much contrast to give for each line in a terrain's set of polygons
type Shader = (index: number) => number

let terrainPolys: Map<Terrain, string[]> = Map()
let terrainShaders: Map<Terrain, Shader> = Map()

const WALL_W = HEX_HALF_HEIGHT / 2 // half the width of the house body
const WALL_H = WALL_W * 9 / 13 // half the height of the house body
const ROOF_W = WALL_H // eaves
const ROOF_H = WALL_W * 15 / 13 // attic
const Y_OFFSET = WALL_H / 2 // shift
const y = Y_OFFSET
terrainPolys = terrainPolys.set(Terrain.City, [
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
terrainShaders = terrainShaders.set(Terrain.City, index => (index % 2 + 2) * 7)

const mtnLeft = HEX_LL_XY.plus(HEX_UL_XY.scale(0.5))
const mtnRight = HEX_LR_XY.plus(HEX_UR_XY.scale(0.7))
const mtnMidBottom = HEX_LL_XY.plus(HEX_RIGHT_XY.scale(0.1))
terrainPolys = terrainPolys.set(Terrain.Mountain, [
    // left mountain
    `${mtnLeft} ${HEX_LL_XY} ${mtnMidBottom} -0,0 -13,-11`,
    // right mountain
    `${mtnMidBottom} ${HEX_LR_XY} ${mtnRight} 8,-13 3,-15`,
])
terrainShaders = terrainShaders.set(Terrain.Mountain, index => (index % 2 + 2) * 10)

interface DrawTerrainProps {
    hexRadius: number,
    terrain: Terrain,
    color: DriftColor,
}

export const TerrainView = (props: DrawTerrainProps) => {
    const polys: string[] | undefined = terrainPolys.get(props.terrain, undefined)
    const shader = terrainShaders.get(props.terrain) as Shader
    if (polys) return(
        <g> {
            polys.map((poly, index) => (
                <polygon
                    points={poly}
                    key={index}
                    style={{
                        stroke: 'none',
                        fill: props.color.texture(shader(index)).toHexString(),
                    }}
                />
            ))
        }
        </g>
    )
    else return (<text>?</text>)
}