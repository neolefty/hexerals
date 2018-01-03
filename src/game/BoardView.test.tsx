import {shallow} from 'enzyme';
import * as React from 'react';
import * as Adapter from 'enzyme-adapter-react-16';
import * as enzyme from 'enzyme';
import {BoardView, SpotView} from './BoardView';
import {Board, Player} from './GameModel';

it('renders a spot', () => {
    enzyme.configure({adapter: new Adapter()});
    const board = Board.construct(3, 5);
    const view = enzyme.render(
        <SpotView spot={board.getSpot(0)} key={0} selected={false} />
    );
    expect(view.text()).toEqual('5');
});

it('renders a board with no selection', () => {
    const n = 4;
    const board = Board.construct(n, 3);
    const view = enzyme.render(
        <BoardView board={board} cursor={NaN}/>
    );
    expect(view.children().length).toEqual(n);  // board size = 10
    expect(view.find('.spot').text()).toEqual(('3003'));
    expect(view.children()[0]).toEqual(view.find('.spot')[0]);
    expect(view.find('.spot').first().text()).toEqual('3');
    expect(view.children()[0].attribs['title']).toEqual(Player.Compy);
    // none are selected
    expect(view.find('.active').length).toEqual(0);
});

it('renders a board with a selection', () => {
    // select one
    const view = enzyme.render(
        <BoardView board={Board.construct(3, 2)} cursor={2} />
    );
    const active = view.find('.active');
    expect(active.length).toEqual(1);  // only one selected
    expect(active[0]).toEqual(view.children()[2]);
});

it('clicks a spot to select it', () => {
    const board = Board.construct(3, 6);
    const spot = board.getSpot(2);
    const props = {
        spot: spot,
        selected: false,
        onSelect: () => props.selected = true,
    };

    const spotWrap = shallow(<SpotView
        spot={props.spot}
        selected={props.selected}
        onSelect={props.onSelect}
    />);

    expect(spotWrap.hasClass('active')).toBeFalsy();
    spotWrap.simulate('click');
    expect(props.selected).toBeTruthy();

    // have to recreate since rendering above uses static reference to props.selected
    expect(shallow(<SpotView spot={props.spot} selected={props.selected}/>)
        .hasClass('active')).toBeTruthy();
});
