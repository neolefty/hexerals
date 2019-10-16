import * as React from 'react';

import {DriftColor} from '../../../color/DriftColor';
import {Hex} from '../../model/hex/Hex';
import {BoardViewProps} from '../board/BoardViewProps';
import {TileHexView} from './TileHexView';
import {Player} from '../../model/players/Players';
import {Set} from 'immutable';
import {Terrain} from '../../model/hex/Terrain'
import {HexTouch} from './HexTouch'

export const viewBoxHeight = (boardHeight: number): number => (boardHeight + 1) * 26

export class HexesView extends React.PureComponent<BoardViewProps> {
    constructor(props: BoardViewProps) {
        super(props)
        this.onDrag = this.onDrag.bind(this)
        this.onClearCursor = this.onClearCursor.bind(this)
        this.onTouchStart = this.onTouchStart.bind(this)
        this.onTouchMove = this.onTouchMove.bind(this)
        this.onTouchEnd = this.onTouchEnd.bind(this)
    }

    onTouchStart(e: React.TouchEvent) {
        // this.logEvent(e)
        for (let i = 0; i < e.touches.length; ++i) {
            const hexTouch = new HexTouch(e.touches[i])
            // console.log(`  — set cursor ${hexTouch}`)
            this.props.onPlaceCursor(hexTouch.id, hexTouch.hex, false)
        }
        if (e.cancelable)
            e.preventDefault()
    }

    onTouchMove(e: React.TouchEvent) {
        // this.logEvent(e)
        for (let i = 0; i < e.touches.length; ++i) {
            const hexTouch = new HexTouch(e.touches[i])
            // console.log(`  — ${hexTouch.toString()}`)
            if (hexTouch.hex !== Hex.NONE)
                this.onDrag(hexTouch.id, hexTouch.hex)
        }
        if (e.cancelable)
            e.preventDefault()
    }

    onTouchEnd(e: React.TouchEvent) {
        // this.logEvent(e)
        for (let i = 0; i < e.changedTouches.length; ++i) {
            const hexTouch = new HexTouch(e.changedTouches[i])
            // console.log(`  — clearing cursor — ${hexTouch}`)
            this.onClearCursor(hexTouch.id)
        }
        if (e.cancelable)
            e.preventDefault()
    }

    render(): React.ReactNode {
        const boardState = this.props.boardState
        const h = viewBoxHeight(boardState.board.edges.height)
        const cursorSet = Set<Hex>(boardState.cursors.values())
        // TODO look into SVGFactory / SVGElement
        return (
            <g
                id="hexMap"
                onTouchStart={this.onTouchStart}
                onTouchMove={this.onTouchMove}
                onTouchCancel={this.onTouchEnd}
                onTouchEnd={this.onTouchEnd}
            >{
                boardState.board.constraints.allReverseSorted.map(hex => {
                    const tile = boardState.board.getTile(hex)
                    const ownerColor: DriftColor | undefined
                        = this.props.colors && this.props.colors.get(tile.owner)
                    const color: DriftColor = ownerColor
                        || (tile.known
                            ? (tile.terrain === Terrain.Empty
                                    ? DriftColor.GREY_80 // highlight explored empties
                                    : DriftColor.GREY_60
                                )
                            : (tile.terrain === Terrain.Mountain
                                    ? DriftColor.GREY_30 // mountains a clear border
                                    : DriftColor.GREY_40
                                )
                        )
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
            }</g>
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

    // logEvent(e: React.SyntheticEvent, prefix: string = '') {
    //     // tslint:disable-next-line
    //     console.log(
    //         `${prefix}@${this.props.hex} ${e.nativeEvent.type} — ${this.props.tile} ${this.props.color.hexString}`)
    // }
}