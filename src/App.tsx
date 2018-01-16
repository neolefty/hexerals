import * as React from 'react';
import './App.css';
import { connect, Dispatch } from 'react-redux';
import { placeCursorAction } from './game/Actions';
import { movePlayerAction } from './game/Actions';
import { BoardView } from './game/BoardView';
import { HexCoord } from './game/Hex';
import { PerfTest } from './game/PerfTest';
import { StoreState } from './game/Types';

const mapStateToProps = (state: StoreState) => ({
    board: state.board,
    cursor: state.cursor,
});

const mapDispatchToProps = (dispatch: Dispatch<StoreState>) => ({
    onMovePlayer: (delta: HexCoord) => {
        dispatch(movePlayerAction(delta, true));
    },
    onPlaceCursor: (position: HexCoord) => {
        dispatch(placeCursorAction(position));
    },
});

// TODO add types -- connect<A,B,C> -- for example, cmd-B on connect or see https://spin.atomicobject.com/2017/04/20/typesafe-container-components/
const BoardContainer = connect(mapStateToProps, mapDispatchToProps)(
    BoardView
);

class App extends React.Component {
    render() {
        return (
            <div className="App">
                <BoardContainer />
                <PerfTest w={500} h={500} />
                <PerfTest w={100} h={100} />
                <PerfTest w={200} h={300} />
                <PerfTest w={500} h={500} />
                {/*
                <PerfTest w={500} h={500} />
                */}
            </div>
        );
    }
}

export default App;
