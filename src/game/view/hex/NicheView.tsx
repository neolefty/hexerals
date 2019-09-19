import * as React from "react"

import './NicheView.css'
import {Hex} from "../../model/hex/Hex"
import {HEX_HALF_HEIGHT, HEX_QUARTER_HEIGHT, HEX_WIDTH} from "./HexConstants"
import {viewBoxHeight} from "./HexesView"
import {centerX, centerY, textSize, textY} from "./TileHexView"

interface NichePropsBase {
    hex: Hex
    topHalf: boolean
    boardHeight: number
    title?: string
}

interface NicheViewProps extends NichePropsBase {
    children: React.ReactNode
}

const translateHalfHex = (hex: Hex, height: number, isTop: boolean) =>
    `translate(${
        centerX(hex.cartX) // - HEX_RADIUS
    },${
        centerY(height, hex.cartY)
        + (isTop ? -HEX_QUARTER_HEIGHT : HEX_QUARTER_HEIGHT)
    })`

export const NicheView = (props: NicheViewProps) =>
    <g
        key={props.hex.id}
        transform={translateHalfHex(props.hex, viewBoxHeight(props.boardHeight), props.topHalf)}
        width={HEX_WIDTH}
        height={HEX_HALF_HEIGHT}
        style={{cursor: 'default'}}
        className='niche'
    >
        {props.title ? <title>{props.title}</title> : undefined}
        {props.title ? <desc>{props.title}</desc> : undefined}
        {props.children}
    </g>

interface NicheTextProps extends NichePropsBase {
    fill?: string
    text: string | number
}

export const NicheText = (props: NicheTextProps) => {
    const s = `${props.text}`
    return (
        <NicheView {...props}>
            <text
                textAnchor="middle"
                fill={props.fill || "#aaa"}
                y={textY(s)}
                fontSize={textSize(s)}
                className='hideOnHover'
            >
                {s}
            </text>
            {props.title ?
                <text
                    textAnchor="middle"
                    fill={props.fill || "#aaa"}
                    y={textY(props.title)}
                    fontSize={textSize(props.title)}
                    className='hideExceptHover'
                >
                    {props.title}
                </text>
                : undefined}
        </NicheView>
    )
}