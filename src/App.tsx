import * as React from 'react';
import './App.css';
import { connect, Dispatch } from 'react-redux';
import { movePlayerAction, placeCursorAction } from './actions';
import { BoardView } from './game/BoardView';
import { StoreState } from './types';

const logo = require('./logo.svg');

const mapStateToProps = (state: StoreState) => ({
    board: state.board,
    cursor: state.cursor,
});

const mapDispatchToProps = (dispatch: Dispatch<StoreState>) => ({
    onMovePlayer: (delta: number) => dispatch(movePlayerAction(delta, true)),
    onPlaceCursor: (position: number) => dispatch(placeCursorAction(position)),
});

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
