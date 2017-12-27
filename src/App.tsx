import * as React from 'react';
import './App.css';
import { Board, Spot } from './game';

const logo = require('./logo.svg');

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
                <BoardView board={new Board(10)}/>
            </div>
        );
    }
}

const BoardView = (props: { board: Board }) => (
    <div className="board">
        {
            props.board.board.map((spot, i) =>
                <SpotView spot={spot} key={i} foo={i}/>
            )
        }
    </div>
);

const SpotView = (props: { spot: Spot, key: number, foo: number }) => (
    <span className="spot" key={props.foo} title={props.spot.owner.toString()}>
        {props.spot.pop}
    </span>
);

export default App;
