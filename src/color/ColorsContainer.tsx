import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import Dimension from '../Dimension';
import {ColorPodge} from './ColorPodge';
import {AppState, GenericAction} from '../App';
import {List} from 'immutable';
import {ColorWheel} from './ColorWheel';

export interface ColorsState {
    colors: ColorPodge;
}

export interface ColorsActions {
    onAddColor: () => void;
}

export interface ColorsProps {
    displaySize: Dimension;
}

type ColorsAction = AddColor; // | RemoveColor;

const ADD_COLOR = 'ADD_COLOR';
type ADD_COLOR = typeof ADD_COLOR;
interface AddColor extends GenericAction { type: ADD_COLOR; }
function isAddColor(action: ColorsAction): action is AddColor {
    return action.type === ADD_COLOR;
}
function addColorAction(): AddColor { return { type: ADD_COLOR }; }

const INITIAL_COLOR_PODGE = new ColorPodge(List([
    ColorPodge.randomColor(), ColorPodge.randomColor(), ColorPodge.randomColor()
]));

export function ColorsReducer(
    state: ColorsState = { colors: INITIAL_COLOR_PODGE },
    action: ColorsAction,
): ColorsState {
    if (isAddColor(action))
        state = {
            ...state,
            colors: state.colors.addRandomColor(),
        };
    return state;
}

export const ColorsContainer = connect(
    (state: AppState) => ({...state.colors}),
    (dispatch: Dispatch<ColorsState>) => ({
        onAddColor: () => dispatch(addColorAction()),
    }),
    /* tslint:disable:no-any */
    (state: ColorsState, actions: ColorsActions, parentProps: any) => ({
        ...state,
        ...actions,
        displaySize: parentProps.displaySize,
    })
    /* tslint:enable */
)(
        ColorWheel
);
