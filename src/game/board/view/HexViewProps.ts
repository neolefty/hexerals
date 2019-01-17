import {DriftColor} from '../../../color/DriftColor';
import {Tile} from '../model/Tile';
import {Hex} from '../model/Hex';

export interface HexViewProps {
    hex: Hex
    tile: Tile
    color: DriftColor
    selected: boolean

    onPlaceCursor?: (cursorIndex: number, where: Hex, clearOthers: boolean) => void
    onDrag?: (cursorIndex: number, dest: Hex) => void
    onClearCursor?: (cursorIndex: number) => void

    children?: JSX.Element | JSX.Element[]
}
