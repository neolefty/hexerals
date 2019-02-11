import * as React from 'react'
import {BOARD_STUBS, BoardViewProps} from './BoardViewBase'
import './GamePhaseView.css'
import {Tile} from '../model/Tile'
import {Hex} from '../model/Hex'
import {List, Map} from 'immutable'
import {Player} from '../model/players/Players'
import {Terrain} from '../model/Terrain'
import {HexBoardView} from './HexBoardView';
import {CartPair} from '../../../common/CartPair';
import {Board} from '../model/Board';
import {MovementQueue} from '../model/MovementQueue';

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
                    <button onClick={props.onEndGame}>
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
                    <strong>Defeat.</strong>
                </div>
                <div className='Row'>
                    <button onClick={props.onRestartGame}>
                        Again
                    </button>
                    <button onClick={props.onEndGame}>
                        Exit
                    </button>
                </div>
            </div>
        </div>
    </div>
)
