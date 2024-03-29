import * as React from 'react'
import {Map} from 'immutable'

import './Help.css'
import {DriftColor} from "../../color/DriftColor"
import {CartPair} from "../../common/CartPair"
import {Hex} from "../../game/model/hex/Hex"
import {Terrain} from "../../game/model/hex/Terrain"
import {Tile} from "../../game/model/hex/Tile"
import {HexMove} from "../../game/model/move/Move"
import {Player} from "../../game/model/players/Players"
import {MoveView} from "../../game/view/board/MoveQueueView"
import {hexPixelHeight, hexPixelWidth} from "../../game/view/hex/HexConstants"
import {TileHexView} from "../../game/view/hex/TileHexView"

export interface HelpOptions {
    displaySize: CartPair
}

const COLUMNS = 3
const ROWS = 8

const h = hexPixelHeight(ROWS)
const w = hexPixelWidth(COLUMNS)

interface TileAndText {
    tile: Tile
    text: string
    color: DriftColor
    extraText?: string
}

const st = (
    tile: Tile, text: string, color: DriftColor = DriftColor.GREY_20,
    extraText: string | undefined = undefined,
) => ({
    tile: tile,
    text: text,
    color: color,
    extraText: extraText,
})

const center = st(
    new Tile(Player.Nobody, 0, Terrain.Capital),
    '', DriftColor.random()
)

const dirs = Map<Hex, TileAndText>([
    [Hex.ORIGIN, center],

    // directions
    [Hex.UP, st(Tile.EMPTY, 'w')],
    [Hex.DOWN, st(Tile.EMPTY, 's')],
    [Hex.LEFT_UP, st(Tile.EMPTY, 'q')],
    [Hex.LEFT_DOWN, st(Tile.EMPTY, 'a')],
    [Hex.RIGHT_UP, st(Tile.EMPTY, 'e')],
    [Hex.RIGHT_DOWN, st(Tile.EMPTY, 'd')],

    [
        Hex.LEFT_DOWN.plus(Hex.DOWN),
        st(Tile.EMPTY, 'z', DriftColor.BLACK, 'cancel 1')
    ],
    [
        Hex.DOWN.plus(Hex.DOWN),
        st(Tile.EMPTY, 'x', DriftColor.BLACK, 'cancel all')
    ],
    [
        Hex.LEFT_UP.plus(Hex.UP),
        st(Tile.EMPTY, 'esc', DriftColor.BLACK, 'end game')
    ],
])

export class Help extends React.PureComponent<HelpOptions> {
    componentDidMount(): void {
        center.color = DriftColor.random()
    }

    render(): React.ReactNode {
        // make space for other elements in this panel
        const hexSpace = this.props.displaySize.scaleXY(.5, 1)
        const spaceRatio = hexSpace.y / Math.max(hexSpace.x, 10)
        const hexRatio = h / w
        const size = (hexRatio > spaceRatio)
            // if hexes are more tall & narrow than screen, limit by height
            ? new CartPair(hexSpace.y / hexRatio, hexSpace.y)
            // otherwise, limit by width
            : new CartPair(hexSpace.x, hexSpace.y * hexRatio)
        return (
            <div
                className="Help Row"
                style={ this.props.displaySize.sizeStyle }
            >
                <div className="Column">
                    <p><strong>Drag to move</strong></p>
                    <p>or movement keys ⟶</p>{/* ➡ ⇨ */}
                    <hr/>
                    <p>cancel 1 move — z</p>
                    <p>cancel all moves — x</p>
                    <p>end game — esc</p>
                    <hr/>
                    <p>
                        Inspired by <a
                            target='_blank'
                            rel='noreferrer noopener'
                            href="http://generals.io/?from=hexpansion.io"
                        >
                            generals.io
                        </a>
                    </p>
                    <p><a href="https://forms.gle/Dpnqm4J5XLWH6fp79">Contact Us</a></p>
                </div>
                <div className="Column">
                    <svg
                        width={size.x}
                        height={size.y}
                        viewBox={[-46, 103, w + 2, h + 2].join(',')}
                    >
                        {
                            dirs.entrySeq()
                                .sort((a, b) => a[0].compareTo(b[0]))
                                .map(([hex, tt]) => (
                                    <TileHexView
                                        key={hex.id}
                                        tile={tt.tile}
                                        hex={hex}
                                        selected={false}
                                        viewBoxHeight={h}
                                        color={tt.color}
                                        text={tt.text}
                                        textColor={DriftColor.WHITE}
                                    >{
                                        tt.extraText ? (
                                            <text
                                                key="subtitle"
                                                fontSize="8"
                                                fill="#aaa"
                                                textAnchor="middle"
                                                y={20}
                                            >
                                                {tt.extraText}
                                            </text>
                                        ) : undefined
                                    }
                                    </TileHexView>
                                ))
                        }
                        {
                            Hex.DIRECTIONS.map(dir => (
                                <MoveView
                                    key={dir.id}
                                    move={new HexMove(Hex.ORIGIN, dir)}
                                    boardHeight={8}
                                    color={center.color}
                                    arrowShift={7}
                                />
                            ))
                        }
                    </svg>
                </div>
            </div>
        )
    }
}
