import * as React from 'react';
import {Tile} from '../model/Tile';
import {FlatTopHex} from './FlatTopHex';
import {HexCoord} from '../model/HexCoord';
import {DriftColor} from '../../../color/DriftColor';

interface TileHexViewProps {
    tile: Tile
    hex: HexCoord
    viewBoxHeight: number
    selected: boolean
    color: DriftColor
    text?: string
    textColor?: DriftColor

    onSelect?: () => void
    onDragInto?: () => void
}

export const centerX = (cartX: number): number => 45 * cartX + 30
export const centerY = (height: number, cartY: number): number => height - (cartY + 1) * 26
export const TileHexView = (props: TileHexViewProps) => {
    const x: number = centerX(props.hex.cartX)
    const y: number = centerY(props.viewBoxHeight, props.hex.cartY)
    return (
        <FlatTopHex
            hex={props.hex}
            owner={props.tile.owner}
            terrain={props.tile.terrain}
            color={props.color}
            selected={props.selected}
            centerX={x}
            centerY={y}
            hexRadius={30}
            onSelect={props.onSelect}
            onDragInto={props.onDragInto}
        >{
            props.text ? (
                <text
                    x={0}
                    y={0.35 * 26}
                    fontFamily="Sans-Serif"
                    fontSize={27}
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