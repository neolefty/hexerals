import {DriftColor} from '../../../color/DriftColor';
import {Terrain} from '../model/Tile';
import * as React from 'react';

const WALL_W = 13 // half the width of the house body
const WALL_H = 9 // half the height of the house body
const ROOF_W = 9 // eaves
const ROOF_H = 15 // attic
const Y_OFFSET = 5 // shift

export const cityPoints = (x: number, y: number) => {
    const y1 = y + Y_OFFSET // shift house baseline down a bit
    // start bottom of left wall and go clockwise
    return `${x - WALL_W},${y1 + WALL_H} ${x - WALL_W},${y1 - WALL_H}` // left wall
        + ` ${x - WALL_W - ROOF_W},${y1 - WALL_H} ${x},${y1 - WALL_H - ROOF_H}`
        + ` ${x + WALL_W + ROOF_W},${y1 - WALL_H}` // roof
        + ` ${x + WALL_W},${y1 - WALL_H} ${x + WALL_W},${y1 + WALL_H}` // right wall
}

export const mountainLines = ['-16,6 -11,-8 -4,2', '-6,12 3,-15, 8,-13 17,4']

interface DrawTerrainProps {
    centerX: number,
    centerY: number,
    hexRadius: number,
    terrain: Terrain,
    color: DriftColor,
}

// hex is 52 tall (middle section is 26 tall) and 60 wide
// assume centered at 0, 0

// corners starting at lower left and going clockwise are:
// (-15, -13) (-30, 0) (-15, 13) (15, 13) (30, 0) (15, -13)

export const TerrainView = (props: DrawTerrainProps): JSX.Element => {
    switch (props.terrain) {
        case Terrain.City:
            return (
                <polygon
                    transform={`translate(${props.centerX} ${props.centerY})`}
                    points={cityPoints(0, 0)}
                    style={{
                        stroke: 'none',
                        fill: props.color.texture().toHexString(),
                    }}
                />
            )
        case Terrain.Mountain:
            return (
                <g
                    transform={`translate(${props.centerX} ${props.centerY})`}
                    style={{
                        // stroke: props.color.texture().toHexString(),
                        // stroke: props.color.contrast().toHexString(),
                        stroke: props.color.lightness > DriftColor.MID_LIGHT
                            ? '#333' : '#bbb',
                        strokeWidth: 4,
                        strokeLinecap: 'square',
                        fill: 'none',
                    }}
                >
                    {
                        mountainLines.map((line, index) => (
                            <polyline points={line} key={index}/>
                        ))
                    }
                </g>
            )
        default:
            throw `Unsupported Terrain: ${props.terrain}`
    }

}