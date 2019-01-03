import * as React from 'react';

import {Tile} from '../model/Tile';
import {getTerrainPolygons, getTerrainShader} from './TerrainPolygons';
import {DriftColor} from '../../../color/DriftColor';

interface TerrainViewProps {
    tile: Tile,
    color: DriftColor,
}

export const TerrainView = (props: TerrainViewProps): JSX.Element => {
    const polygons: string[] | undefined = getTerrainPolygons(props.tile)
    const shader = getTerrainShader(props.tile)
    return polygons
        ? (
            <g> {
                polygons.map((poly, index) => (
                    <polygon
                        points={poly}
                        key={index}
                        style={{
                            stroke: 'none',
                            fill: shader(index, props.color).toHexString(),
                        }}
                    />
                ))
            }
            </g>
        )
    : (<text>?</text>)
}