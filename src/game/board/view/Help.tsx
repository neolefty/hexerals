import * as React from 'react';
import Dimension from '../../../common/Dimension';
import {SpottedHex} from './SpottedHex';
import {Spot, Terrain} from '../model/Spot';
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

interface SpotAndText {
    spot: Spot
    text: string
    color: DriftColor
}

const st = (spot: Spot, text: string, color: DriftColor = DriftColor.GREY_20) =>
    ({ spot: spot, text: text, color: color })

const dirs = Map<HexCoord, SpotAndText>([
    [
        HexCoord.ORIGIN,
        st(new Spot(Player.Nobody, 0, Terrain.City), '', DriftColor.GREY_20),
    ],
    [HexCoord.UP, st(Spot.BLANK, 'w')],
    [HexCoord.DOWN, st(Spot.BLANK, 's')],
    [HexCoord.LEFT_UP, st(Spot.BLANK, 'q')],
    [HexCoord.LEFT_DOWN, st(Spot.BLANK, 'a')],
    [HexCoord.RIGHT_UP, st(Spot.BLANK, 'e')],
    [HexCoord.RIGHT_DOWN, st(Spot.BLANK, 'd')],
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
                        <SpottedHex
                            key={hex.id}
                            spot={dirs.get(hex).spot}
                            hex={hex}
                            selected={false}
                            viewBoxHeight={h}
                            // color={DriftColor.GREY_40}
                            color={dirs.get(hex).color}
                            render={(x, y) => (
                                <text
                                    x={x}
                                    y={y + 0.35 * 26}
                                    fontSize={27}
                                    textAnchor="middle"
                                    fill="#fff"
                                >
                                    {dirs.get(hex).text}
                                </text>
                            )}
                        />
                    ))}
            </svg>
            <p>z — cancel 1 move</p>
            <p>x — cancel all moves</p>
            <p>esc — end game</p>
        </div>
    )
}