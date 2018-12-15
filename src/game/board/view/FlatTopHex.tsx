import * as React from 'react';

import {Player} from '../../players/Players';
import {DriftColor} from '../../../color/DriftColor';

export interface FlatTopHexProps {
    owner: Player
    color?: DriftColor
    selected: boolean
    centerX: number
    centerY: number
    hexRadius: number
    onSelect: () => void
    contents: string
    children?: JSX.Element | JSX.Element[] // could user "any?" instead
}

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
        onClick={(/*e*/) => props.onSelect()}
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
        {props.children && <g>{props.children}</g>}
    </g>
)