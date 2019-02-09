import * as React from 'react'
import {BoardViewProps} from './BoardViewBase'
import './GamePhaseView.css'

export const Ended = (props: BoardViewProps) => (
    <div className='GamePhaseView'>
        <div className='Modal'>
            It's Over!
            <button onMouseDown={props.onEndGame}>
                Done
            </button>
        </div>
    </div>
)
