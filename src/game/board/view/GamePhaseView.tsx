import * as React from 'react'
import {BoardViewProps} from './BoardViewBase'

export const BeforeStart = (props: BoardViewProps) => (
    <div className='Floater'>Starting ...</div>
)

export const Ended = (props: BoardViewProps) => (
    <div className='Floater'>It's over!</div>
)

