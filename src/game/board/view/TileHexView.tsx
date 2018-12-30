import * as React from 'react';
import {Tile} from '../model/Tile';
import {FlatTopHex} from './FlatTopHex';
import {Hex} from '../model/Hex';
import {DriftColor} from '../../../color/DriftColor';
import {HEX_COLUMN, HEX_HALF_HEIGHT, HEX_RADIUS} from './HexContants';

interface TileHexViewProps {
    tile: Tile
    hex: Hex
    viewBoxHeight: number
    selected: boolean
    color: DriftColor
    text?: string
    textColor?: DriftColor

    onSelect?: () => void
    onDragInto?: () => void
}

export const centerX = (cartX: number): number =>
    HEX_COLUMN * cartX + HEX_RADIUS
export const centerY = (height: number, cartY: number): number =>
    height - (cartY + 1) * HEX_HALF_HEIGHT
export const TileHexView = (props: TileHexViewProps) => {
    const x: number = centerX(props.hex.cartX)
    const y: number = centerY(props.viewBoxHeight, props.hex.cartY)
    return (
        <FlatTopHex
            hex={props.hex}
            tile={props.tile}
            color={props.color}
            selected={props.selected}
            centerX={x}
            centerY={y}
            hexRadius={HEX_RADIUS}
            onSelect={props.onSelect}
            onDragInto={props.onDragInto}
        >{
            props.text ? (
                <text
                    // TODO move this into a style sheet
                    y={props.tile.known ? 0.35 * HEX_HALF_HEIGHT : 0.5 * HEX_HALF_HEIGHT}
                    fontFamily="Sans-Serif"
                    fontSize={HEX_HALF_HEIGHT * (props.tile.known ? 1 : 1.5)}
                    textAnchor="middle"
                    fill={(props.textColor || props.color.contrast()).toHexString()}
                >
                    {props.text}
                </text>
            ) : undefined
        }
        </FlatTopHex>
    )
}