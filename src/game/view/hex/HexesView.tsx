import {Set} from 'immutable'
import * as React from "react"
import {useCallback} from "react"

import {DriftColor} from '../../../color/DriftColor'
import {Hex} from '../../model/hex/Hex'
import {Terrain} from '../../model/hex/Terrain'
import {Player} from '../../model/players/Players'
import {BoardViewProps} from '../board/BoardViewProps'
import {HexTouch} from './HexTouch'
import {TileHexView} from './TileHexView'

export const viewBoxHeight = (boardHeight: number): number => (boardHeight + 1) * 26

export const HexesView = (props: BoardViewProps) => {
    // TODO: maybe only support a single cursor -- would make this memoize-able
    const onDrag = (cursorIndex: number, dest: Hex) => {
        const bs = props.boardState
        const source: Hex = bs.cursors.get(cursorIndex, Hex.NONE)
        const player: Player | undefined = bs.curPlayer
        if (source !== Hex.NONE && player && source !== dest) {
            // console.log(`  >> dragging #${cursorIndex} from ${source.toString()} to ${dest.toString()}`)
            props.onDrag(player, cursorIndex, source, dest)
        }
    }

    const onClearCursor = useCallback((cursorIndex: number) => {
        props.onPlaceCursor(cursorIndex, Hex.NONE, false)
    }, [props.onPlaceCursor])

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        // this.logEvent(e)
        for (let i = 0; i < e.touches.length; ++i) {
            const hexTouch = new HexTouch(e.touches[i])
            // console.log(`  — set cursor ${hexTouch}`)
            props.onPlaceCursor(hexTouch.id, hexTouch.hex, false)
        }
        if (e.cancelable)
            e.preventDefault()
    }, [props.onPlaceCursor])

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        // this.logEvent(e)
        for (let i = 0; i < e.touches.length; ++i) {
            const hexTouch = new HexTouch(e.touches[i])
            // console.log(`  — ${hexTouch.toString()}`)
            if (hexTouch.hex !== Hex.NONE)
                onDrag(hexTouch.id, hexTouch.hex)
        }
        if (e.cancelable)
            e.preventDefault()
    }, [onDrag])

    const onTouchEnd = useCallback((e: React.TouchEvent) => {
        // this.logEvent(e)
        for (let i = 0; i < e.changedTouches.length; ++i) {
            const hexTouch = new HexTouch(e.changedTouches[i])
            // console.log(`  — clearing cursor — ${hexTouch}`)
            onClearCursor(hexTouch.id)
        }
        if (e.cancelable)
            e.preventDefault()
    }, [onClearCursor])

    const boardState = props.boardState
    const h = viewBoxHeight(boardState.board.edges.height)
    const cursorSet = Set<Hex>(boardState.cursors.values())
    // TODO look into SVGFactory / SVGElement
    return (
        <g
            id="hexMap"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchCancel={onTouchEnd}
            onTouchEnd={onTouchEnd}
        >{
            boardState.board.constraints.allReverseSorted.map(hex => {
                const tile = boardState.board.getTile(hex)
                const ownerColor: DriftColor | undefined
                    = props.colors && props.colors.get(tile.owner)
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
                        onClearCursor={onClearCursor}
                        onPlaceCursor={props.onPlaceCursor}
                        onDrag={onDrag}
                    />
                )
            })
        }</g>
    )
}
