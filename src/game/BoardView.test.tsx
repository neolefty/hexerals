import { shallow } from 'enzyme';
import * as React from 'react';
import * as Adapter from 'enzyme-adapter-react-16';
import * as enzyme from 'enzyme';
import { HexCoord } from './Hex';
import { Player } from './HexBoard';
import { BoardView, SpotView } from './BoardView';
import { HexBoard } from './HexBoard';

it('renders a spot', () => {
    enzyme.configure({adapter: new Adapter()});
    const board = HexBoard.constructSquare(3, 5);
    const view = enzyme.render(
        <SpotView
            spot={board.getSpot(HexCoord.ORIGIN)} key={0} selected={false}
        />
    );
    expect(view.text()).toEqual('5');
});

it('renders a board with no selection', () => {
    const n = 3; // *** / ** / ***
    const board = HexBoard.constructSquare(n, 3);
    const view = enzyme.render(
        <BoardView
            board={board}
            cursor={HexCoord.NONE}
            onPlaceCursor={() => {}}
            onMovePlayer={() => {}}
        />
    );
    expect(view.children().length).toEqual(n);  // n rows
    const spots = view.find('.spot');
    expect(spots.length).toEqual(8);
    expect(spots.text()).toEqual(('300'+'00'+'003'));
    expect(spots.first().text()).toEqual('3');
    expect(spots[0].attribs['title']).toEqual(Player.Compy);
    // none are selected
    expect(view.find('.active').length).toEqual(0);
});

it('renders a board with a selection', () => {
    // select lower-right corner
    const board = HexBoard.constructSquare(3, 2);
    const lr = board.constraints.extreme(c => - c.cartY() - c.cartX());
    const view = enzyme.render(
        <BoardView
            board={board}
            cursor={lr}
            onPlaceCursor={() => {}}
            onMovePlayer={() => {}}
        />
    );
    const active = view.find('.active');
    expect(active.length).toEqual(1);  // only one selected
    expect(active[0]).toEqual(view.children()[2]);
});

it('clicks a spot to select it', () => {
    const board = HexBoard.constructSquare(3, 6);
    const spot = board.getSpot(board.constraints.extreme(c => - c.cartX() - c.cartY()));
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
