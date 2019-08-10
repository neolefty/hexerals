import * as React from "react"

import {Niches} from "../../model/board/Niches"
import {Hex} from "../../model/hex/Hex"
import {HEX_QUARTER_HEIGHT} from "./HexConstants"
import {centerX, centerY} from "./TileHexView"

type HexMatcher = (hex: Hex) => React.ReactNode | undefined

interface NichesViewProps {
    matcher: HexMatcher
    niches: Niches
    viewBoxHeight: number
}

export const NichesView = (props: NichesViewProps) => (
    <>
        {
            props.niches.tops.map(hex => NicheView({
                child: props.matcher(hex),
                hex: hex,
                isTop: true,
                viewBoxHeight: props.viewBoxHeight,
            }))
        }
        {
            props.niches.bottoms.map(hex => props.matcher(hex))
        }
    </>
)

interface NicheViewProps {
    hex: Hex
    isTop: boolean
    child: React.ReactNode
    viewBoxHeight: number
}

const translateHalfHex = (hex: Hex, height: number, isTop: boolean) =>
    `translate(${
        centerX(hex.cartX)
    },${
        centerY(height, hex.cartY)
        + (isTop ? HEX_QUARTER_HEIGHT : -HEX_QUARTER_HEIGHT)
    })`

const NicheView = (props: NicheViewProps): React.ReactNode =>
    props.child === undefined ? undefined :
        <g
            key={props.hex.id}
            transform={translateHalfHex(props.hex, props.viewBoxHeight, props.isTop)}
        >
            {props.child}
        </g>

