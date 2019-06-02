import * as React from 'react'

import {CartPair} from '../../../common/CartPair'
import {BOARD_STUBS} from '../board/BoardViewBase'
import {BoardAndStats} from '../board/BoardAndStats'
import {LocalGameOptions} from '../../model/board/LocalGameOptions'
import {greyColors} from './BoringColor'
import {getPreviewBoard} from './PreviewCache'

export interface LocalGamePreviewProps {
    localOptions: LocalGameOptions
    highFidelity: boolean
    displaySize: CartPair
}

export const LocalGamePreview = (props: LocalGamePreviewProps) => {
    const boardState = getPreviewBoard(props.localOptions, props.highFidelity)
    return (
        <BoardAndStats
            {...BOARD_STUBS}
            displaySize={props.displaySize}
            colors={greyColors(boardState)}
            boardState={boardState}
            grabFocus={false}
            statsVisible={props.localOptions.statsVisible !== 0}
        />
    )
}