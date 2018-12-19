import * as React from 'react';
import {List, Map} from 'immutable';

import {MovementQueue} from '../model/MovementQueue';
import {DriftColor} from '../../../color/DriftColor';
import {Player} from '../../players/Players';
import {viewBoxHeight} from './FilterBoardView';
import {HexMove} from '../model/Move';
import {centerX, centerY} from './SpottedHex';

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
                    <g key={player.valueOf()}>
                        <MoveListView
                            moveList={moveList}
                            color={props.colors.get(player)}
                            boardHeight={props.boardHeight}
                        />
                    </g>
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
            />
        )
    }
    </g>
)

interface MoveViewProps {
    move: HexMove
    color?: DriftColor
    boardHeight: number
}

const MoveView = (props: MoveViewProps) => {
    const x1 = centerX(props.move.source.cartX())
    const x2 = centerX(props.move.dest.cartX())
    const h = viewBoxHeight(props.boardHeight)
    const y1 = centerY(h, props.move.source.cartY())
    const y2 = centerY(h, props.move.dest.cartY())
    return (
        <polygon
            points={`${x1},${y1} ${x2},${y2}`}
            style={
                props.color && {
                    stroke: props.color.toHexString(),
                    strokeWidth: 3,
                }
            }
        />
    )
}