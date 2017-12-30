import {Board, Player} from './GameModel';
import * as Adapter from 'enzyme-adapter-react-16';
import {GamePlayerControl} from './GameControl';
import * as enzyme from 'enzyme';
import {BoardView, SpotView} from './BoardView';
import * as React from 'react';

it('renders a spot', () => {
    enzyme.configure({adapter: new Adapter()});
    const control = new GamePlayerControl(Player.HUMAN, Board.construct(3, 5));
    const spot = enzyme.render(
        <SpotView control={control} key={0} position={0} />
    );
    expect(spot.text()).toEqual('5');
});

it('renders the board', () => {
    const n = 4;
    const control = new GamePlayerControl(Player.HUMAN, Board.construct(n, 3));
    const board = enzyme.render(
        <BoardView control={control} />
    );
    expect(board.children().length).toEqual(n);  // board size = 10
    expect(board.find('.spot').text()).toEqual(('3003'));
    expect(board.children()[0]).toEqual(board.find('.spot')[0]);
    expect(board.find('.spot').first().text()).toEqual('3');
    expect(board.children()[0].attribs['title']).toEqual(Player.COMPY.name)
});

