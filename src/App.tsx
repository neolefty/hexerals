import * as React from 'react';
import './App.css';
import { connect, Dispatch } from 'react-redux';
import { placeCursorAction } from './game/Actions';
import { movePlayerAction } from './game/Actions';
import { BoardView } from './game/BoardView';
import { HexCoord } from './game/Hex';
import { StoreState } from './game/Types';

const logo = require('./logo.svg');

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
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h2>Welcome to React</h2>
                </div>
                <p className="App-intro">
                    To get started, edit <code>src/App.tsx</code> and save to reload.
                </p>
                <BoardContainer />
            </div>
        );
    }
}

export default App;
