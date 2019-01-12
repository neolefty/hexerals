import * as React from 'react';
import {Tile} from '../model/Tile';
import {FlatTopHex} from './FlatTopHex';
import {DriftColor} from '../../../color/DriftColor';
import {HEX_COLUMN, HEX_HALF_HEIGHT, HEX_RADIUS} from './HexConstants';
import {Terrain} from '../model/Terrain';
import {HexViewProps} from './HexViewProps';

interface TileHexViewProps extends HexViewProps {
    viewBoxHeight: number
    text?: string
    textColor?: DriftColor
}

export const centerX = (cartX: number): number =>
    HEX_COLUMN * cartX + HEX_RADIUS
export const centerY = (height: number, cartY: number): number =>
    height - (cartY + 1) * HEX_HALF_HEIGHT

export const textY = (tile: Tile, text: String): number => {
    // position in body of capital or question mark in mountain
    let result = 0.5 * HEX_HALF_HEIGHT
    // center in known empty & house
    if (tile.known && tile.terrain !== Terrain.Capital)
        result = 0.35 * HEX_HALF_HEIGHT
    if (text) // longer text is small, so shift it up to compensate
        result -= 0.03 * HEX_HALF_HEIGHT * (text.length - 1)
    return result
}
export const textSize = (tile: Tile, text: String): number => {
    let result = HEX_HALF_HEIGHT
    // large "?"
    if (!tile.known) result *= 1.5
    if (text.length > 1)
        result *= (0.9 ** (text.length - 1))
    return result
}

export const TileHexView = (props: TileHexViewProps) => {
    const x: number = centerX(props.hex.cartX)
    const y: number = centerY(props.viewBoxHeight, props.hex.cartY)

    let children: JSX.Element[] = []

    // draw text first
    if (props.text)
        children.push(
            <text
                key="pop"
                // TODO move this into a style sheet
                y={textY(props.tile, props.text)}
                fontFamily="Sans-Serif"
                fontSize={textSize(props.tile, props.text)}
                textAnchor="middle"
                fill={(props.textColor || props.color.contrast()).toHexString()}
            >
                {props.text}
            </text>
        )

    // and additional children next
    if (Array.isArray(props.children))
        children.push(...props.children)
    else if (props.children)
        children.push(props.children as JSX.Element)

    return (
        <FlatTopHex
            {...props}
            centerX={x}
            centerY={y}
        >
            {children}
        </FlatTopHex>
    )
}