import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import App from './App';
import {GamePlayerControl} from './game/GameControl';
import {Board, Move, Player, Spot} from './game/GameModel';
import {BoardView} from './game/BoardView';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
});

it('renders the board', () => {
    const n = 10;
    enzyme.configure({adapter: new Adapter()});
    const control = new GamePlayerControl(Player.Human, new Board(n));
    const board = enzyme.render(<BoardView control={control} />);
    expect(board.children().length).toEqual(n);  // board size = 10
    expect(board.find('.spot').text()).toEqual(('3000000003'));
    expect(board.children()[0]).toEqual(board.find('.spot')[0]);
    expect(board.find('.spot').first().text()).toEqual('3');
});

it('game model basics', () => {
    const n = 10;
    const control = new GamePlayerControl(Player.Human, new Board(n));
    const foo = () => control.createMove(-1);
    expect(foo).toThrowError();
    control.cursor = 9;
    expect(foo()).toEqual(new Move(9, -1));
    expect(foo().dest()).toEqual(8);
    control.board.apply(foo());
    expect(control.board.positions[7]).toEqual(new Spot(Player.Nobody, 0));
    expect(control.board.positions[8]).toEqual(new Spot(Player.Human, 2));
    expect(control.board.positions[9]).toEqual(new Spot(Player.Human, 1));
});

