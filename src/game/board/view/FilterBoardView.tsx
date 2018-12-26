import * as React from 'react';

import {DriftColor} from '../../../color/DriftColor';
import {HexCoord} from '../model/HexCoord';
import {BoardViewProps} from './BoardViewBase';
import {TileHexView} from './TileHexView';
import {PlayerMove} from '../model/Move';
import {List} from 'immutable';
import {Player} from '../../players/Players';

export const viewBoxHeight = (boardHeight: number): number => (boardHeight + 1) * 26

interface FilterBoardViewProps extends BoardViewProps {
    filter: (hex: HexCoord) => boolean
}

export class FilterBoardView extends React.Component<FilterBoardViewProps> {
    constructor(props: FilterBoardViewProps) {
        super(props)
        this.makeOnDrag = this.makeOnDrag.bind(this)
    }

    makeOnDrag = (hex: HexCoord) => () => {
        const cursor: HexCoord | undefined = this.props.boardState.cursor
        const player: Player | undefined = this.props.boardState.curPlayer
        if (cursor && player && hex.getNeighbors().contains(cursor)) {
            this.props.onQueueMoves(List([
                PlayerMove.construct(
                    player,
                    cursor,
                    hex.minus(this.props.boardState.cursor)
                )
            ]))
            this.props.onPlaceCursor(hex)
        }
    }

    render(): React.ReactNode {
        const boardState = this.props.boardState
        const h = viewBoxHeight(boardState.board.edges.height)
        // TODO look into SVGFactory / SVGElement
        return (
            <g id="hexMap"> {
                boardState.board.constraints.all().filter(
                    this.props.filter
                ).map(hex => {
                    const tile = boardState.board.getTile(hex)
                    const maybeColor: DriftColor | undefined
                        = this.props.colors && this.props.colors.get(tile.owner)
                    const color: DriftColor = maybeColor || DriftColor.BLACK
                    return (
                        <TileHexView
                            key={hex.id}
                            text={tile.pop === 0 ? undefined : `${tile.pop}`}
                            tile={tile}
                            color={color}
                            hex={hex}
                            selected={hex === boardState.cursor}
                            viewBoxHeight={h}
                            onSelect={() => this.props.onPlaceCursor(hex)}
                            onDragInto={this.makeOnDrag(hex)}
                        />
                    )
                })
            }
            </g>
        )
    }
}