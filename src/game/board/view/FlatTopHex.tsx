import * as React from 'react'

import {DriftColor} from '../../../color/DriftColor'
import {Tile} from '../model/Tile'
import {TerrainView} from './TerrainView'
import {Hex} from '../model/Hex'
import {Terrain} from '../model/Terrain';
import {HEX_HALF_HEIGHT, HEX_MID, HEX_RADIUS} from './HexContants';

export interface FlatTopHexProps {
    hex: Hex
    tile: Tile
    color: DriftColor
    selected: boolean
    centerX: number
    centerY: number
    onSelect?: () => void
    onDragInto?: () => void
    children?: JSX.Element | JSX.Element[]
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

// hex centered at (0, 0)
const HEX_POINTS = hexPoints(0, 0)

// a hexagon centered at (x, y)
export class FlatTopHex
    extends React.PureComponent<FlatTopHexProps>
{
    render(): React.ReactNode {
        // const logEvent = (desc: string) => console.log(
        //     `${desc} — ${props.hex} / ${props.terrain} ${props.color.toHexString()}`
        // )
        // tslint:disable-next-line
        const logEvent = (desc: string) => {}

        const children: JSX.Element[] = [(
            <polygon
                key="bg"
                points={HEX_POINTS}
                style={
                    this.props.color && {
                        fill: this.props.color.toHexString()
                    }
                }
            />
        )]

        if (this.props.selected)
            children.push(
                <polygon
                    key="cursor"
                    className="cursor"
                    points={HEX_POINTS}
                    style={{
                        stroke: this.props.color.contrast().toHexString(),
                    }}
                />
            )

        children.push(
            <polygon
                key="hover"
                className="hover"
                points={HEX_POINTS}
                style={{
                    stroke: this.props.color.contrast().toHexString(),
                }}
            />
        )

        if (this.props.tile.terrain !== Terrain.Empty) children.push(
            <TerrainView
                key={this.props.hex.id}
                tile={this.props.tile}
                color={this.props.color}
            />
        )

        if (Array.isArray(this.props.children))
            children.push(...this.props.children as JSX.Element[])
        else if (this.props.children)
            children.push(this.props.children as JSX.Element)

        return (
            <g
                transform={`translate(${this.props.centerX} ${this.props.centerY})`}
                className={`FlatTopHex ${this.props.tile.owner} tile${this.props.selected ? ' active' : ''}`}
                onMouseDown={(e) => {
                    logEvent(`onMouseDown ${e}`)
                    if (this.props.onSelect) {
                        e.preventDefault()
                        this.props.onSelect()
                    }
                }}
                onTouchStart={(e) => { // not standard — Chrome only?
                    logEvent(`onTouchStart ${e.nativeEvent.type}`)
                    if (this.props.onSelect) {
                        e.preventDefault()
                        this.props.onSelect()
                    }
                }}
                onMouseEnter={(e) => {
                    logEvent(`onMouseEnter ${e.nativeEvent.type} ${e.buttons}`)
                    if (this.props.onDragInto && e.buttons === 1) { // left mouse button
                        this.props.onDragInto()
                        e.preventDefault()
                    }
                }}

                onDragEnter={(e) => {logEvent(`onDragEnter ${e.nativeEvent.type}`)}}
                onTouchMove={(e) => {logEvent(`onTouchMove ${e.nativeEvent.type}`)}}
                onTouchCancel={(e) => {logEvent(`onTouchCancel ${e.nativeEvent.type}`)}}
                onDragOver={(e) => {logEvent(`onDragOver ${e.nativeEvent.type}`)}}
                onMouseDownCapture={(e) => {logEvent(`onMouseDownCapture ${e.nativeEvent.type}`)}}
            >
                {children}
            </g>
        )    }
}