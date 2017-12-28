import * as React from 'react';
import './App.css';
import { Board, Player } from './game/GameModel';
import { BoardView } from './game/BoardView';
import { GamePlayerControl } from './game/GameControl';

const logo = require('./logo.svg');
let game = new Board(10);
let playerControl = new GamePlayerControl(Player.Human, game);

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
                <BoardView control={playerControl}/>
            </div>
        );
    }
}

export default App;
