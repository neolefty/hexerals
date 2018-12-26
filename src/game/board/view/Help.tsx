import * as React from 'react';
import Dimension from '../../../common/Dimension';
import {TileHexView} from './TileHexView';
import {Tile, Terrain} from '../model/Tile';
import {HexCoord} from '../model/HexCoord';
import {DriftColor} from '../../../color/DriftColor';
import {Map} from 'immutable';
import {Player} from '../../players/Players';
import './Help.css'

export interface HelpOptions {
    displaySize: Dimension;
}

const h = 6 * 26
const w = 3 * 45 + 15

interface TileAndText {
    tile: Tile
    text: string
    color: DriftColor
}

const st = (tile: Tile, text: string, color: DriftColor = DriftColor.GREY_20) =>
    ({ tile: tile, text: text, color: color })

const dirs = Map<HexCoord, TileAndText>([
    [
        HexCoord.ORIGIN,
        st(new Tile(Player.Nobody, 0, Terrain.City), '', DriftColor.GREY_20),
    ],
    [HexCoord.UP, st(Tile.BLANK, 'w')],
    [HexCoord.DOWN, st(Tile.BLANK, 's')],
    [HexCoord.LEFT_UP, st(Tile.BLANK, 'q')],
    [HexCoord.LEFT_DOWN, st(Tile.BLANK, 'a')],
    [HexCoord.RIGHT_UP, st(Tile.BLANK, 'e')],
    [HexCoord.RIGHT_DOWN, st(Tile.BLANK, 'd')],
])

export const Help = (props: HelpOptions) => {
    const d = Math.min(props.displaySize.w - 50, props.displaySize.h - 120)
    return (
        <div
            className="Help"
            style={{
                width: props.displaySize.w,
                height: props.displaySize.h,
            }}
        >
            <svg
                width={d}
                height={d * (h / w)}
                viewBox={[-46, 51, w + 2, h + 2].join(',')}
            >
                {
                    dirs.keySeq().map((hex: HexCoord) => (
                        <TileHexView
                            key={hex.id}
                            tile={dirs.get(hex).tile}
                            hex={hex}
                            selected={false}
                            viewBoxHeight={h}
                            color={dirs.get(hex).color}
                            text={dirs.get(hex).text}
                            textColor={DriftColor.WHITE}
                        />
                    ))}
            </svg>
            <p>z — cancel 1 move</p>
            <p>x — cancel all moves</p>
            <p>esc — end game</p>
        </div>
    )
}