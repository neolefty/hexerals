import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import App from './App';
import {GamePlayerControl} from './game/GameControl';
import {Board, Player} from './game/GameModel';
import {BoardView} from './game/BoardView';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
});

it('renders the correct size board', () => {
    enzyme.configure({adapter: new Adapter()});
    const control = new GamePlayerControl(Player.Human, new Board(10));
    const board = enzyme.render(<BoardView control={control} />);
    expect(board.children().length).toEqual(10);  // board size = 10
    expect(board.find('.spot').text()).toEqual(('3000000003'));
    expect(board.children()[0]).toEqual(board.find('.spot')[0]);
    expect(board.find('.spot').first().text()).toEqual('3');
});