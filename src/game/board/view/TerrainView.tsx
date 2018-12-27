import * as React from 'react';

import {Terrain} from '../model/Tile';
import {getTerrainPolygons, getTerrainShader} from './TerrainPolygons';
import {DriftColor} from '../../../color/DriftColor';
import {HEX_HALF_HEIGHT} from './HexContants';

interface TerrainViewProps {
    hexRadius: number,
    terrain: Terrain,
    color: DriftColor,
}

export const TerrainView = (props: TerrainViewProps): JSX.Element => {
    const polygons: string[] | undefined = getTerrainPolygons(props.terrain)
    const shader = getTerrainShader(props.terrain)
    let result: JSX.Element = polygons
        ? (
            <g> {
                polygons.map((poly, index) => (
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
        : (<text>?</text>)
    if (props.terrain === Terrain.MaybeMountain)
        result = (
            <g>
                {result}
                // TODO move this into a style sheet, same as TileHexView
                <text
                    y={0.35 * HEX_HALF_HEIGHT}
                    fontSize={HEX_HALF_HEIGHT}
                    textAnchor="middle"
                    fill={props.color.texture(25).toHexString()}
                >
                    ?
                </text>
            </g>
        )
    return result
}