import {Board} from '../../model/board/Board'
import * as React from 'react'
import {NicheText} from './NicheView'

// noinspection JSUnusedGlobalSymbols
export const NicheDebugView = (props: { board: Board }) => {
    const niches = props.board.niches
    const edges = props.board.edges
    const h = edges.height
    return (
        <>
            {
                niches.tops.map((hex, index) => (
                    <NicheText text={index} hex={hex} topHalf={false} boardHeight={h} fill="red"/>
                ))
            }
            {
                niches.bottoms.map((hex, index) => (
                    <NicheText text={index} hex={hex} topHalf={true} boardHeight={h} fill="blue "/>
                ))
            }
            <NicheText text="board ur" hex={edges.upperRight} topHalf={true} boardHeight={h}/>
            <NicheText hex={niches.ur} topHalf={false} boardHeight={h} text="ur niche"/>
            <NicheText hex={niches.ul} topHalf={false} boardHeight={h} text="ul niche"/>
            <NicheText hex={niches.ll} topHalf={true} boardHeight={h} text="ll niche"/>
            <NicheText hex={niches.lr} topHalf={true} boardHeight={h} text="lr niche"/>
        </>
    )
}