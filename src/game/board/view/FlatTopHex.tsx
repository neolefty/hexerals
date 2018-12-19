import * as React from 'react';

import {Player} from '../../players/Players';
import {DriftColor} from '../../../color/DriftColor';
import {Terrain} from '../model/Spot';
import {cityPoints} from './TerrainView';

export interface FlatTopHexProps {
    owner: Player
    terrain: Terrain
    color?: DriftColor
    selected: boolean
    centerX: number
    centerY: number
    hexRadius: number
    onSelect?: () => void
    children?: JSX.Element | JSX.Element[] // could use "any?" instead
}

export const HEX_MID = 15
export const HEX_HALF_HEIGHT = 26

const hexPoints = (x: number, y: number, hexRadius: number) => {
    const hexMid = 15
    const hexHalfHeight = 26
    return ''
        + (x - hexRadius) + ',' + y + ' ' // left
        + (x - hexMid) + ',' + (y - hexHalfHeight) + ' ' // up left
        + (x + hexMid) + ',' + (y - hexHalfHeight) + ' ' // up right
        + (x + hexRadius) + ',' + y + ' ' // right
        + (x + hexMid) + ',' + (y + hexHalfHeight) + ' ' // down right
        + (x - hexMid) + ',' + (y + hexHalfHeight) // down left
}

// a hexagon centered at (x, y)
export const FlatTopHex = (props: FlatTopHexProps) => (
    <g
        onMouseDown={(e) => {
            if (props.onSelect) {
                e.preventDefault()
                props.onSelect()
            }
        }}
        className={
            props.owner
            + ' spot'
            + (props.selected ? ' active' : '')
        }
    >
        <polygon
            points={hexPoints(props.centerX, props.centerY, props.hexRadius)}
            style={
                props.color && {
                    fill: props.color.toHexString()
                }
            }
        />
        {
            props.terrain === Terrain.City
                ? (<polygon
                    points={cityPoints(props.centerX, props.centerY)}
                    style={
                        props.color && {
                            stroke: 'none',
                            fill: props.color.texture().toHexString(),
                        }
                    }
                />)
                : undefined
        }

        {props.children && <g>{props.children}</g>}
    </g>
)