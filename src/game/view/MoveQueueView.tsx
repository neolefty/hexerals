import * as React from 'react';
import {List, Map} from 'immutable';

import {MovementQueue} from '../model/move/MovementQueue';
import {DriftColor} from '../../color/DriftColor';
import {Player} from '../model/players/Players';
import {viewBoxHeight} from './HexesView';
import {HexMove} from '../model/move/Move';
import {centerX, centerY} from './TileHexView';

interface MoveQueueViewProps {
    moves: MovementQueue
    colors: Map<Player, DriftColor>
    players: List<Player>
    boardHeight: number
}

export const MoveQueueView = (props: MoveQueueViewProps) => (
    <g id="movementQueue"> {
        props.moves.playerQueues.map(
            (moveList: List<HexMove>, player: Player) => {
                return (
                    <MoveListView
                        key={props.players.indexOf(player)}
                        moveList={moveList}
                        color={props.colors.get(player)}
                        boardHeight={props.boardHeight}
                    />
                )
            }
        ).toArray() // is there a direct way to map to an iterator (like a list) rather than a map?
    }
    </g>
)

interface MoveListViewProps {
    moveList: List<HexMove>
    color?: DriftColor
    boardHeight: number
}

const MoveListView = (props: MoveListViewProps) => (
    <g> {
        props.moveList.map((move: HexMove, key: number) =>
            <MoveView
                key={key}
                color={props.color}
                boardHeight={props.boardHeight}
                move={move}
                arrowShift={0}
            />
        )
    }
    </g>
)

interface MoveViewProps {
    move: HexMove
    color?: DriftColor
    boardHeight: number
    arrowShift: number
}

const a = 12  // arrow start
const b = 20 // arrow length
const c = 8 // arrow width
const d = 8 // arrow head length
const sw = 2 // stroke width

export const MoveView = (props: MoveViewProps) => {
    const x1 = centerX(props.move.source.cartX)
    // const x2 = centerX(props.move.dest.cartX)
    const h = viewBoxHeight(props.boardHeight)
    const y1 = centerY(h, props.move.source.cartY)
    // const y2 = centerY(h, props.move.dest.cartY)

    const delta = props.move.dest.minus(props.move.source)
    const a1 = props.arrowShift + a

    /* tslint:disable:whitespace */
    return (
        <g>
            <g
                transform={`rotate(${-delta.degrees} ${x1} ${y1})`}
                style={
                    props.color && {
                        stroke: props.color.texture().toHexString(),
                        strokeWidth: sw,
                        strokeLinecap: 'square',
                        fill: 'none',
                    }
                }
            >
                <polyline // arrow shaft
                    points={`${x1+a1},${y1} ${x1+a1+b-sw},${y1}`}
                />
                <polyline // arrow head
                    points={`${x1+a1+b-d},${y1-c} ${x1+a1+b},${y1} ${x1+a1+b-d},${y1+c}`}
                />
            </g>
        </g>
    )
}