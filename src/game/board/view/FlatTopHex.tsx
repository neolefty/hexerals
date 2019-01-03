import * as React from 'react'

import {DriftColor} from '../../../color/DriftColor'
import {Tile} from '../model/Tile'
import {TerrainView} from './TerrainView'
import {Hex} from '../model/Hex'
import {Terrain} from '../model/Terrain';
import {HEX_HALF_HEIGHT, HEX_MID, HEX_RADIUS} from './HexContants';

export interface FlatTopHexProps {
    hex?: Hex
    tile: Tile
    color: DriftColor
    selected: boolean
    centerX: number
    centerY: number
    onSelect?: () => void
    onDragInto?: () => void
    children?: JSX.Element | JSX.Element[] // could use "any?" instead
}

const hexPoints = (x: number, y: number) => {
    return ''
        + (x - HEX_RADIUS) + ',' + y + ' ' // left
        + (x - HEX_MID) + ',' + (y - HEX_HALF_HEIGHT) + ' ' // up left
        + (x + HEX_MID) + ',' + (y - HEX_HALF_HEIGHT) + ' ' // up right
        + (x + HEX_RADIUS) + ',' + y + ' ' // right
        + (x + HEX_MID) + ',' + (y + HEX_HALF_HEIGHT) + ' ' // down right
        + (x - HEX_MID) + ',' + (y + HEX_HALF_HEIGHT) // down left
}

const HEX_POINTS = hexPoints(0, 0)

// a hexagon centered at (x, y)
export const FlatTopHex = (props: FlatTopHexProps) => {
    // const logEvent = (desc: string) => console.log(
    //     `${desc} — ${props.hex} / ${props.terrain} ${props.color.toHexString()}`
    // )
    // tslint:disable-next-line
    const logEvent = (desc: string) => {}
    return (
        <g
            transform={`translate(${props.centerX} ${props.centerY})`}
            className={`FlatTopHex ${props.tile.owner} tile${props.selected ? ' active' : ''}`}
            onMouseDown={(e) => {
                logEvent(`onMouseDown ${e}`)
                if (props.onSelect) {
                    e.preventDefault()
                    props.onSelect()
                }
            }}
            onTouchStart={(e) => { // not standard — Chrome only
                logEvent(`onTouchStart ${e.nativeEvent.type}`)
                if (props.onSelect) {
                    e.preventDefault()
                    props.onSelect()
                }
            }}
            onMouseEnter={(e) => {
                logEvent(`onMouseEnter ${e.nativeEvent.type} ${e.buttons}`)
                if (props.onDragInto && e.buttons === 1) { // TODO look up canonical value
                    props.onDragInto()
                    e.preventDefault()
                }
            }}

            onDragEnter={(e) => {logEvent(`onDragEnter ${e.nativeEvent.type}`)}}
            onTouchMove={(e) => {logEvent(`onTouchMove ${e.nativeEvent.type}`)}}
            onTouchCancel={(e) => {logEvent(`onTouchCancel ${e.nativeEvent.type}`)}}
            onDragOver={(e) => {logEvent(`onDragOver ${e.nativeEvent.type}`)}}
            onMouseDownCapture={(e) => {logEvent(`onMouseDownCapture ${e.nativeEvent.type}`)}}
        >
            <polygon
                points={HEX_POINTS}
                style={
                    props.color && {
                        fill: props.color.toHexString()
                    }
                }
            />
            {
                props.tile.terrain !== Terrain.Empty ? (
                    <TerrainView
                        tile={props.tile}
                        color={props.color}
                    />
                ) : undefined
            }
            {props.children && <g>{props.children}</g>}
        </g>
    )
}