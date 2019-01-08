import * as React from 'react';

import {CartPair} from '../../../common/CartPair';
import {TileHexView} from './TileHexView';
import {Tile} from '../model/Tile';
import {Hex} from '../model/Hex';
import {DriftColor} from '../../../color/DriftColor';
import {Map} from 'immutable';
import {Player} from '../model/players/Players';
import {Terrain} from '../model/Terrain';
import {MoveView} from './MoveQueueView';
import {HexMove} from '../model/Move';
import {HEX_COLUMN, HEX_MID, HEX_ROW} from './HexContants';

import './Help.css'

export interface HelpOptions {
    displaySize: CartPair;
}

const h = 4.5 * HEX_ROW
const w = 3 * HEX_COLUMN + HEX_MID

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
        const hexSpace = this.props.displaySize.plusXY(-400, 0)
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
                style={{
                    width: this.props.displaySize.x,
                    height: this.props.displaySize.y,
                }}
            >
                <div className="Column">
                    <p><strong>click and drag<br/>to move, or:</strong></p>
                    <hr/>
                    <p>movement keys ⟶</p>{/* ➡ ⇨ */}
                    <p>end game — esc</p>
                    <p>cancel 1 move — z</p>
                    <p>cancel all moves — x</p>
                    <hr/>
                    <p>phone & tablet support<br/>coming soon</p>
                </div>
                <div className="Column">
                    <svg
                        width={size.x}
                        height={size.y}
                        viewBox={[-46, 103, w + 2, h + 2].join(',')}
                    >
                        {
                            dirs.keySeq().map((hex: Hex) => (
                                <TileHexView
                                    key={hex.id}
                                    tile={dirs.get(hex).tile}
                                    hex={hex}
                                    selected={false}
                                    viewBoxHeight={h}
                                    color={dirs.get(hex).color}
                                    text={dirs.get(hex).text}
                                    textColor={DriftColor.WHITE}
                                >{
                                    dirs.get(hex).extraText ? (
                                        <text
                                            key="subtitle"
                                            fontSize="8"
                                            fill="#aaa"
                                            textAnchor="middle"
                                            y={20}
                                        >
                                            {dirs.get(hex).extraText}
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