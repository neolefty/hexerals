import * as React from 'react'
import {List, Map} from 'immutable'

import {
    AnalyticsAction, AnalyticsCategory, AnalyticsLabel, logAnalyticsEvent,
} from '../../../common/Analytics'
import {CartPair} from '../../../common/CartPair'
import {Tile} from '../../model/hex/Tile'
import {Hex} from '../../model/hex/Hex'
import {Player} from '../../model/players/Players'
import {Terrain} from '../../model/hex/Terrain'
import {Board} from '../../model/board/Board'
import {MovementQueue} from '../../model/move/MovementQueue'
import {BOARD_STUBS, BoardViewProps} from '../board/BoardViewBase'
import {HexBoardView} from '../board/HexBoardView'
import './GamePhaseView.css'

const singleHexBoard = (
    props: BoardViewProps, tile: Tile,
    grabFocus: boolean = false, fraction: number = 3,
): BoardViewProps => ({
    ...props,
    ...BOARD_STUBS, // avoid actual actions
    grabFocus: grabFocus,
    displaySize: new CartPair(
        props.displaySize.min / fraction,
        props.displaySize.min / fraction
    ),
    boardState: {
        ...props.boardState,
        cursors: Map(),
        board: Board.constructSquare(
            1, List<Player>(props.boardState.curPlayer || Player.Zero)
        ).setTiles(Map<Hex, Tile>([[Hex.ORIGIN, tile]])),
        moves: new MovementQueue(),
    }
})

export const Victory = (props: BoardViewProps) => (
    <div className='GamePhaseView'>
        <div className='Modal'>
            <div className='Column'>
                <div className='Row'>
                    <HexBoardView {
                        ...singleHexBoard(
                            props,
                            new Tile(Player.Zero, 0, Terrain.Capital)
                        )
                    }/>
                </div>
                <div className='Row'>
                    <strong>Victory!</strong>
                </div>
                <div className='Row'>
                    <button onClick={props.onRestartGame}>
                        Again
                    </button>
                    <button onClick={() => {
                        logAnalyticsEvent(
                            AnalyticsAction.return, AnalyticsCategory.local, AnalyticsLabel.win
                        )
                        props.onEndGame()
                    }}>
                        Exit
                    </button>
                </div>
            </div>
        </div>
    </div>
)

export const Defeat = (props: BoardViewProps) => (
    <div className='GamePhaseView'>
        <div className='Modal'>
            <div className='Column'>
                <div className='Row'>
                    <HexBoardView {
                        ...singleHexBoard(
                            props,
                            new Tile(Player.Zero, 0, Terrain.Mountain)
                        )
                    }/>
                </div>
                <div className='Row'>
                    <strong>defeat.</strong>
                </div>
                <div className='Row'>
                    <button onClick={props.onRestartGame}>
                        Again
                    </button>
                    <button onClick={() => {
                        logAnalyticsEvent(
                            AnalyticsAction.return, AnalyticsCategory.local, AnalyticsLabel.lose
                        )
                        props.onEndGame()
                    }}>
                        Exit
                    </button>
                </div>
            </div>
        </div>
    </div>
)
