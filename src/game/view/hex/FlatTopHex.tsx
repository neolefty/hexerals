import * as React from 'react'

import {TerrainView} from './TerrainView'
import {Terrain} from '../../model/hex/Terrain'
import {HEX_POINTS} from './HexConstants'
import {HexViewProps} from './HexViewProps'

export interface FlatTopHexProps extends HexViewProps {
    centerX: number
    centerY: number
}

// a hexagon centered at (x, y)
export const FlatTopHex = (props: FlatTopHexProps) => {
    const hexIdAttribute = {
        // Attribute of the top SVG element, for retrieval from Touch events
        'hex-id': props.hex.id
    }

    const children: JSX.Element[] = [(
        <polygon
            {...hexIdAttribute}
            key="bg"
            points={HEX_POINTS}
            style={
                props.color && {
                    fill: props.color.hexString
                }
            }
        />
    )]

    if (props.selected)
        children.push(
            <polygon
                key="cursor"
                className="cursor"
                points={HEX_POINTS}
                style={{
                    stroke: props.color.contrast().hexString,
                }}
            />
        )

    children.push(
        <polygon
            key="hover"
            className="hover"
            points={HEX_POINTS}
            style={{
                stroke: props.color.contrast().hexString,
            }}
        />
    )

    if (props.tile.terrain !== Terrain.Empty) children.push(
        <TerrainView
            key={props.hex.id}
            tile={props.tile}
            color={props.color}
        />
    )

    if (Array.isArray(props.children))
        children.push(...props.children as JSX.Element[])
    else if (props.children)
        children.push(props.children as JSX.Element)

    return (
        <g
            transform={`translate(${props.centerX} ${props.centerY})`}
            className={`FlatTopHex ${props.tile.owner} tile${props.selected ? ' active' : ''}`}

            onMouseEnter={(e) => {
                // left mouse button
                if (props.onDrag && e.buttons === 1) {
                    props.onDrag(0, props.hex)
                    e.preventDefault()
                }
            }}
            onMouseDown={(e) => {
                if (props.onPlaceCursor) {
                    props.onPlaceCursor(0, props.hex, true)
                    e.preventDefault()
                }
            }}
        >
            {children}
        </g>
    )
}