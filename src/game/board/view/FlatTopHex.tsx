import * as React from 'react'

import {Player} from '../../players/Players'
import {DriftColor} from '../../../color/DriftColor'
import {Terrain} from '../model/Spot'
import {TerrainView} from './TerrainView'
import {HexCoord} from '../model/HexCoord'

export interface FlatTopHexProps {
    hex?: HexCoord
    owner: Player
    terrain: Terrain
    color: DriftColor
    selected: boolean
    centerX: number
    centerY: number
    hexRadius: number
    onSelect?: () => void
    onDragInto?: () => void
    children?: JSX.Element | JSX.Element[] // could use "any?" instead
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
export const FlatTopHex = (props: FlatTopHexProps) => {
    // const logIt = (desc: string) => console.log(
    //     `${desc} — ${props.hex} / ${props.terrain} ${props.color.toHexString()}`
    // )
    const logIt = (desc: string) => {}
    return (
        <g
            onMouseDown={(e) => {
                logIt(`onMouseDown ${e}`)
                if (props.onSelect) {
                    e.preventDefault()
                    props.onSelect()
                }
            }}
            onTouchStart={(e) => { // not standard — Chrome only
                logIt(`onTouchStart ${e.nativeEvent.type}`)
                if (props.onSelect) {
                    e.preventDefault()
                    props.onSelect()
                }
            }}
            onMouseEnter={(e) => {
                logIt(`onMouseEnter ${e.nativeEvent.type} ${e.buttons}`)
                if (props.onDragInto && e.buttons === 1) { // TODO look up canonical value
                    props.onDragInto()
                    e.preventDefault()
                }
            }}

            onDragEnter={(e) => {logIt(`onDragEnter ${e.nativeEvent.type}`)}}
            onTouchMove={(e) => {logIt(`onTouchMove ${e.nativeEvent.type}`)}}
            onTouchCancel={(e) => {logIt(`onTouchCancel ${e.nativeEvent.type}`)}}
            onDragOver={(e) => {logIt(`onDragOver ${e.nativeEvent.type}`)}}
            // onMouseDownCapture={(e) => {logIt(`onMouseDownCapture ${e.nativeEvent.type}`)}}
            className={`${props.owner} spot${props.selected ? ' active' : ''}`}
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
                props.terrain !== Terrain.Empty ? (
                        <TerrainView
                            centerX={props.centerX}
                            centerY={props.centerY}
                            hexRadius={props.hexRadius}
                            terrain={props.terrain}
                            color={props.color}
                        />
                    )
                    : undefined
            }

            {props.children && <g>{props.children}</g>}
        </g>
    )
}