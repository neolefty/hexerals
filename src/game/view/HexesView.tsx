import * as React from 'react';

import {DriftColor} from '../../color/DriftColor';
import {Hex} from '../model/hex/Hex';
import {BoardViewProps} from './BoardViewBase';
import {TileHexView} from './TileHexView';
import {Player} from '../model/players/Players';
import {Set} from 'immutable';

export const viewBoxHeight = (boardHeight: number): number => (boardHeight + 1) * 26

export class HexesView extends React.PureComponent<BoardViewProps> {
    constructor(props: BoardViewProps) {
        super(props)
        this.onDrag = this.onDrag.bind(this)
        this.onClearCursor = this.onClearCursor.bind(this)
    }

    render(): React.ReactNode {
        const boardState = this.props.boardState
        const h = viewBoxHeight(boardState.board.edges.height)
        const cursorSet = Set<Hex>(boardState.cursors.values())
        // TODO look into SVGFactory / SVGElement
        return (
            <g id="hexMap"> {
                boardState.board.constraints.allSorted.map(hex => {
                    const tile = boardState.board.getTile(hex)
                    const ownerColor: DriftColor | undefined
                        = this.props.colors && this.props.colors.get(tile.owner)
                    const color: DriftColor = ownerColor
                        || (tile.known ? DriftColor.GREY_60 : DriftColor.GREY_40)
                    const text = !tile.known && !tile.isBlank() ? '?' : tile.pop !== 0 ? `${tile.pop}` : undefined
                    // undefined means let the TileHexView decide
                    const textColor = !tile.known ? color.texture(30) : undefined
                    return (
                        <TileHexView
                            key={hex.id}
                            text={text}
                            textColor={textColor}
                            tile={tile}
                            color={color}
                            hex={hex}
                            selected={cursorSet.contains(hex)}
                            viewBoxHeight={h}
                            onClearCursor={this.onClearCursor}
                            onPlaceCursor={this.props.onPlaceCursor}
                            onDrag={this.onDrag}
                        />
                    )
                })
            }
            </g>
        )
    }

    onClearCursor = (cursorIndex: number) =>
        this.props.onPlaceCursor(cursorIndex, Hex.NONE, false)

    onDrag = (cursorIndex: number, dest: Hex) => {
        const bs = this.props.boardState
        const source: Hex = bs.cursors.get(cursorIndex, Hex.NONE)
        const player: Player | undefined = bs.curPlayer
        if (source !== Hex.NONE && player && source !== dest) {
            // console.log(`  >> dragging #${cursorIndex} from ${source.toString()} to ${dest.toString()}`)
            this.props.onDrag(player, cursorIndex, source, dest)
        }
    }
}