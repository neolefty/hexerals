import * as React from 'react'
import {BoardViewProps} from './BoardViewBase'

export const BeforeStart = (props: BoardViewProps) => (
    <div className='Modal Row'>
        <div className='Column'>
            Starting ...
        </div>
    </div>
)

export const Ended = (props: BoardViewProps) => (
    <div
        className='Column'
        style={ props.displaySize.sizeStyle }
    >
        <div className='Modal Row'>
            It's Over!
        </div>
    </div>
)

export const Started = (props: BoardViewProps) => (
    <div
        className='Column'
        style={ props.displaySize.sizeStyle }
    >
        <div className='Row Modal'>
            Wheeee!
        </div>
    </div>
)

