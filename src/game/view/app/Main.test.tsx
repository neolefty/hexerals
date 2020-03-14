import * as React from "react"
import TestRenderer, {ReactTestRenderer} from 'react-test-renderer'
import {initialColorState} from "../../../color/ColorsReducer"
import {MainReducer, MainState} from "../../../main/MainReducer"
import {BoardState} from "../../model/board/BoardState"
import {DEFAULT_LOCAL_GAME_OPTIONS} from "../../model/board/LocalGameOptions"
import {changeLocalOptionAction, INITIAL_CYCLE_STATE, openLocalGameAction} from "../../model/cycle/CycleReducer"
import {HexBoardView} from "../board/HexBoardView"
import {countHexes} from "../hex/HexConstants"
import {Mini} from "./Mini"

interface InactiveBoardViewProps {
    boardState: BoardState
}
const InactiveBoardView = ({boardState}: InactiveBoardViewProps) =>
    <HexBoardView
        boardState={boardState}
        onQueueMoves={() => {}}
        onDrag={() => {}}
        onCancelMoves={() => {}}
        onPlaceCursor={() => {}}
        onEndGame={() => {}}
        onRestartGame={() => {}}
        onResetColors={() => {}}
    />

it('renders without crashing', () => {
    let blank: ReactTestRenderer | undefined = undefined
    TestRenderer.act(() => {
        blank = TestRenderer.create(<Mini/>)
    })
    expect(blank).toBeDefined()
    const blankRenderer = blank as unknown as ReactTestRenderer
    // console.log(blankRenderer.toJSON())
    const hasSubstring = (s: any, sub: string) => (typeof s === 'string' && s.indexOf(sub) >= 0)
    const blanksHexes = blankRenderer.root.findAll(node => hasSubstring(node.props.className, 'FlatTopHex'))
    // Note: when rendered, it will not be default board dimensions because the board will have been fit to the screen
    const dlgo = DEFAULT_LOCAL_GAME_OPTIONS
    // console.log(dlgo)
    // console.log('expect', countHexes(dlgo.boardWidth, dlgo.boardHeight))
    // expect(blanksHexes.length).toBe(countHexes(dlgo.boardWidth, dlgo.boardHeight))
    const blanksCastles = blanksHexes.filter(g => !hasSubstring(g.props.className, 'Nobody'))
    expect(blanksCastles.length).toBe(dlgo.numRobots + 1)
    const blanksBlanks = blanksHexes.filter(g => hasSubstring(g.props.className, 'Nobody'))
    expect(blanksCastles.length + blanksBlanks.length).toEqual(blanksHexes.length)
    // console.log('nobody', blanksBlanks.length)
    // console.log('all', blanksHexes.length)
    // blanksHexes.forEach(g => {
    //     if (!hasSubstring(g.props.className, 'Nobody'))
    //         console.log(g.props.className, '|', g.props.transform)
    // })

    const labels = blankRenderer.root.findAll(n => n.props.className === 'LabelAfter')
    let foundDimensionLabel = false
    labels.forEach(label => {
        const s = `${label}`
        if (s.indexOf(' x ') > 0) {
            foundDimensionLabel = true
            const words = s.split(' ')
            expect(words.length).toBe(3)
            const w = Number.parseInt(words[0])
            const h = Number.parseInt(words[2])
            const n = countHexes(w, h)
            expect(n).toEqual(blanksHexes.length)
            expect(n).toBeGreaterThan(50)
            expect(n).toBeLessThan(100)
        }
    })

    let startedState: MainState = {
        cycle: INITIAL_CYCLE_STATE,
        colors: initialColorState(),
    }
    let started: ReactTestRenderer | undefined = undefined
    TestRenderer.act(() => {
        started = TestRenderer.create(
            <Mini init={
                state => {
                    let result = state
                    result = MainReducer(result, changeLocalOptionAction('mountainPercent', 0))
                    result = MainReducer(result, openLocalGameAction())
                    startedState = result
                    return result
                }
            }/>
        )
    })
    expect(started).toBeDefined()
    const startedRenderer = started as unknown as ReactTestRenderer
    // console.log(startedRenderer.toJSON())

    expect(startedState.cycle.localGame?.boardState.board.capitals.size)
        .toBe(INITIAL_CYCLE_STATE.localOptions.numRobots + 1)

    const gs = startedRenderer.root.findAllByType('g')
    expect(gs.length).toBeGreaterThan(blanksHexes.length)
    // expect(gs.length === 9)
    // gs.forEach(g => console.log(g.props['className']))

    expect(startedState.cycle.localGame?.boardState).toBeDefined()
    const boardState: BoardState | undefined = startedState.cycle.localGame?.boardState
    if (boardState) {
        const boardView = TestRenderer.create(<InactiveBoardView boardState={boardState}/>)
        // console.log(boardView.toJSON())
    }

    // const div = document.createElement('div')
    //
    // const render = (init?: Init) =>
    //     ReactDOM.render(Mini({init}), div)
    //
    // // render it without a game
    // render()
    //
    // // render it with a game
    // render(state => {
    //     let result = state
    //     result = MainReducer(result, changeLocalOptionAction('mountainPercent', 0))
    //     result = MainReducer(result, openLocalGameAction())
    //     return result
    // })
    // // expect(hoistedState?.cycle.localGame?.boardState.board.capitals.size).toBe(2)
})

// TODO test whole redux integration with connect (see Main.tsx) & GUI events (see HexBoardView.test.tsx)
