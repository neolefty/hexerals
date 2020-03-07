import * as React from "react"
import TestRenderer from 'react-test-renderer'
import {Mini} from "./Mini"

it('renders without crashing', () => {
    const blank = TestRenderer.create(
        <Mini/>
    )
    console.log(blank.toJSON())

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
