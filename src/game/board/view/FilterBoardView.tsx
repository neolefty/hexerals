import * as React from 'react';

import {DriftColor} from '../../../color/DriftColor';
import {Hex} from '../model/Hex';
import {BoardViewProps} from './BoardViewBase';
import {TileHexView} from './TileHexView';
import {PlayerMove} from '../model/Move';
import {List} from 'immutable';
import {Player} from '../model/players/Players';
import {floodShortestPath} from '../model/ShortestPath';

export const viewBoxHeight = (boardHeight: number): number => (boardHeight + 1) * 26

interface FilterBoardViewProps extends BoardViewProps {
    filter: (hex: Hex) => boolean
}

export class FilterBoardView extends React.PureComponent<FilterBoardViewProps> {
    constructor(props: FilterBoardViewProps) {
        super(props)
        this.makeOnDrag = this.makeOnDrag.bind(this)
    }

    // drag behavior:
    //   * cursor follows initial selection & drag
    //   * dragging adds to queue, preferring high-pop hexes
    //   * backtracking (exactly) removes from queue
    // high-speed drag behavior (not implemented):
    //   * cursor set by drag start, follows tail of queue
    //   * dragging resets queue to be best path from cursor
    //   * no need for additional queue removal behavior
    makeOnDrag = (dragHex: Hex) => () => {
        const bs = this.props.boardState
        const cursor: Hex | undefined = bs.cursor
        const player: Player | undefined = bs.curPlayer
        if (cursor && player) {
            const dragTile = bs.board.getTile(dragHex)
            if (dragTile.canBeOccupied()) {  // drag into mountain --> no effect
                // path from cursor
                let path = floodShortestPath(bs.board.hexesOccupiable, cursor, dragHex)

                // did we backtrack?
                const queued: List<PlayerMove> = bs.moves.playerQueues.get(player)
                let nCancel = 0
                if (queued && queued.size) {
                    const rPath = path.reverse()
                    const rQueued = queued.reverse()
                    while (
                        nCancel < rPath.size && nCancel < rQueued.size
                        && rPath.get(nCancel) === rQueued.get(nCancel).source
                    )
                        ++nCancel
                }
                if (nCancel > 0) {
                    this.props.onCancelMoves(player, nCancel)
                    path = List(path.slice(0, path.size - nCancel))
                }

                // queue the rest of the path as moves
                if (path.size > 0) {
                    // console.log(hexesToString(path))
                    this.props.onQueueMoves(List(
                        // pop because path includes dest — a path of n means n-1 moves
                        path.pop().map((source, index) =>
                            PlayerMove.constructDest(
                                player, source, path.get(index + 1)
                            )
                        )
                    ))
                }
                this.props.onPlaceCursor(dragHex)
            }
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
                    const ownerColor: DriftColor | undefined
                        = this.props.colors && this.props.colors.get(tile.owner)
                    const color: DriftColor = ownerColor
                        || (tile.known && tile.canBeOccupied() ? DriftColor.GREY_60 : DriftColor.GREY_40)
                    const text = !tile.known && !tile.isBlank() ? '?' : tile.pop !== 0 ? `${tile.pop}` : undefined
                    const textColor = !tile.known ? color.texture(20) : undefined
                    return (
                        <TileHexView
                            key={hex.id}
                            text={text}
                            textColor={textColor}
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