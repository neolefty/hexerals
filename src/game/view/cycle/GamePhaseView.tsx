import {List, Map} from 'immutable'
import * as React from 'react'

import {AnalyticsAction, AnalyticsCategory, AnalyticsLabel, logAnalyticsEvent,} from '../../../common/Analytics'
import {DisplaySizeProvider, useDisplaySize} from "../../../common/ViewSizeContext"
import {Board} from '../../model/board/Board'
import {DEFAULT_LOCAL_GAME_OPTIONS} from "../../model/board/LocalGameOptions"
import {Hex} from '../../model/hex/Hex'
import {Terrain} from '../../model/hex/Terrain'
import {Tile} from '../../model/hex/Tile'
import {MovementQueue} from '../../model/move/MovementQueue'
import {Player} from '../../model/players/Players'
import {BOARD_STUBS, BoardViewProps} from '../board/BoardViewProps'
import {HexBoardView} from '../board/HexBoardView'
import './GamePhaseView.css'

const singleHexBoard = (
    props: BoardViewProps, tile: Tile, grabFocus: boolean = false,
): BoardViewProps => ({
    ...props,
    ...BOARD_STUBS, // avoid actual actions
    grabFocus: grabFocus,
    boardState: {
        ...props.boardState,
        cursors: Map(),
        board: Board.constructRectangular(
            {
                ...DEFAULT_LOCAL_GAME_OPTIONS,
                cityTicks: Infinity, // never advance turns
                boardHeight: 1,
                boardWidth: 1,
            }, List<Player>(props.boardState.curPlayer || Player.Zero)
        ).setTiles(Map<Hex, Tile>([[Hex.ORIGIN, tile]])),
        moves: new MovementQueue(),
    }
})

export const Victory = (props: BoardViewProps) => {
    const displaySize = useDisplaySize()
    return (
        <div className='GamePhaseView'>
            <div className='Modal'>
                <div className='Column'>
                    <div className='Row'>
                        <DisplaySizeProvider size={displaySize.scale(1/3)}>
                            <HexBoardView {
                                ...singleHexBoard(
                                    props,
                                    new Tile(Player.Zero, 0, Terrain.Capital)
                                )
                            }/>
                        </DisplaySizeProvider>
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
}

export const Defeat = (props: BoardViewProps) => {
    const displaySize = useDisplaySize()
    return (
        <div className='GamePhaseView'>
            <div className='Modal'>
                <div className='Column'>
                    <div className='Row'>
                        <DisplaySizeProvider size={displaySize.scale(1/3)}>
                            <HexBoardView {
                                ...singleHexBoard(
                                    props,
                                    new Tile(Player.Zero, 0, Terrain.Mountain)
                                )
                            }/>
                        </DisplaySizeProvider>
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
}
