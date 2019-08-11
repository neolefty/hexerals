import * as React from "react"

import {Niches} from "../../model/board/Niches"
import {Hex} from "../../model/hex/Hex"
import {HEX_HALF_HEIGHT, HEX_QUARTER_HEIGHT, HEX_WIDTH} from "./HexConstants"
import {viewBoxHeight} from "./HexesView"
import {centerX, centerY, textSize} from "./TileHexView"

type HexMatcher = (hex: Hex) => React.ReactNode | undefined

interface NichesViewProps {
    matcher: HexMatcher
    niches: Niches
    boardHeight: number
}

export const NichesView = (props: NichesViewProps) => (
    <>
        {
            props.niches.tops.map(hex => (
                <NicheView hex={hex} topHalf={false} boardHeight={props.boardHeight}>
                    { props.matcher(hex) }
                </NicheView>
            ))
        }
        {
            props.niches.bottoms.map(hex => (
                <NicheView hex={hex} topHalf={true} boardHeight={props.boardHeight}>
                    { props.matcher(hex) }
                </NicheView>
            ))
        }
    </>
)

interface NichePropsBase {
    hex: Hex
    topHalf: boolean
    boardHeight: number
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
    >
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
                y="10" fontSize={textSize(s)}
            >
                {s}
            </text>
        </NicheView>
    )
}
