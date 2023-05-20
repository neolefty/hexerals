import * as React from 'react'
import {LocalGameOptions} from '../../model/board/LocalGameOptions'
import {BoardAndStats} from '../board/BoardAndStats'
import {BOARD_STUBS} from '../board/BoardViewProps'
import {greyColors} from './BoringColor'
import {getPreviewBoard} from './PreviewCache'

export interface LocalGamePreviewProps {
    localOptions: LocalGameOptions
    highFidelity: boolean
}

export const LocalGamePreview = (props: LocalGamePreviewProps) => {
    const boardState = getPreviewBoard(props.localOptions, props.highFidelity)
    return (
        <BoardAndStats
            {...BOARD_STUBS}
            colors={greyColors(boardState)}
            boardState={boardState}
            grabFocus={false}
            statsVisible={props.localOptions.statsVisible !== 0}
        />
    )
}