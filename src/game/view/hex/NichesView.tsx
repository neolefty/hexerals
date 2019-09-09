import * as React from 'react'
import {Niches} from '../../model/board/Niches'
import {Hex} from '../../model/hex/Hex'
import {NicheView} from './NicheView'

type HexMatcher = (hex: Hex) => React.ReactNode | undefined

interface NichesViewProps {
    matcher: HexMatcher
    niches: Niches
    boardHeight: number
}

// noinspection JSUnusedGlobalSymbols
export const NichesView = (props: NichesViewProps) => (
    <>
        {
            props.niches.tops.map(hex => (
                <NicheView hex={hex} topHalf={false} boardHeight={props.boardHeight}>
                    {props.matcher(hex)}
                </NicheView>
            ))
        }
        {
            props.niches.bottoms.map(hex => (
                <NicheView hex={hex} topHalf={true} boardHeight={props.boardHeight}>
                    {props.matcher(hex)}
                </NicheView>
            ))
        }
    </>
)