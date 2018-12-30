import * as React from 'react';
import CartPair from '../../../common/CartPair';
import {TileHexView} from './TileHexView';
import {Tile, Terrain} from '../model/Tile';
import {Hex} from '../model/Hex';
import {DriftColor} from '../../../color/DriftColor';
import {Map} from 'immutable';
import {Player} from '../model/players/Players';
import './Help.css'

export interface HelpOptions {
    displaySize: CartPair;
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

const dirs = Map<Hex, TileAndText>([
    [
        Hex.ORIGIN,
        st(new Tile(Player.Nobody, 0, Terrain.City), '', DriftColor.GREY_20),
    ],
    [Hex.UP, st(Tile.BLANK, 'w')],
    [Hex.DOWN, st(Tile.BLANK, 's')],
    [Hex.LEFT_UP, st(Tile.BLANK, 'q')],
    [Hex.LEFT_DOWN, st(Tile.BLANK, 'a')],
    [Hex.RIGHT_UP, st(Tile.BLANK, 'e')],
    [Hex.RIGHT_DOWN, st(Tile.BLANK, 'd')],
])

export const Help = (props: HelpOptions) => {
    const d = Math.min(props.displaySize.x - 50, props.displaySize.y - 120)
    return (
        <div
            className="Help"
            style={{
                width: props.displaySize.x,
                height: props.displaySize.y,
            }}
        >
            <svg
                width={d}
                height={d * (h / w)}
                viewBox={[-46, 51, w + 2, h + 2].join(',')}
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
                        />
                    ))}
            </svg>
            <p>z — cancel 1 move</p>
            <p>x — cancel all moves</p>
            <p>esc — end game</p>
        </div>
    )
}