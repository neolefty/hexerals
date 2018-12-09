import {connect} from 'react-redux'
import {Dispatch} from 'redux'
import Dimension from '../Dimension'
import {ColorPodge} from './ColorPodge'
import {AppState, GenericAction} from '../App'
import {List} from 'immutable'
import {DriftColor} from './DriftColor'
import {ColorsDiv} from './ColorsDiv'

const TICK = 100 // milliseconds
// TODO simulate annealing by progressing from large ticks down
const DRIFT = 5
const NEVER_SETTLE = true

export interface ColorsState {
    colors: ColorPodge
}

export interface ColorsActions {
    onAddColor: () => void
    onRemoveColor: (x: number) => void
    onDiverge: () => void
}

export interface ColorsProps {
    displaySize: Dimension
    tick: number
}

type ColorsAction = AddColor | RemoveColor | Diverge

const DIVERGE = 'DIVERGE'
type DIVERGE = typeof DIVERGE
interface Diverge extends GenericAction { type: DIVERGE }
const isDiverge = (action: ColorsAction): action is Diverge => 
    action.type === DIVERGE
const divergeAction = (): Diverge  => ({ type: DIVERGE })

const ADD_COLOR = 'ADD_COLOR'
type ADD_COLOR = typeof ADD_COLOR
interface AddColor extends GenericAction { type: ADD_COLOR }
const isAddColor = (action: ColorsAction): action is AddColor =>
    action.type === ADD_COLOR
const addColorAction = (): AddColor => ({ type: ADD_COLOR })

const REMOVE_COLOR = 'REMOVE_COLOR'
type REMOVE_COLOR = typeof REMOVE_COLOR
interface RemoveColor extends GenericAction {
    type: REMOVE_COLOR
    x: number
}
const isRemoveColor = (action: ColorsAction): action is RemoveColor =>
    action.type === REMOVE_COLOR
const removeColorAction = (x: number): RemoveColor => ({
    type: REMOVE_COLOR,
    x: x,
})

const INITIAL_COLOR_PODGE = new ColorPodge(
    List([
        DriftColor.random(), DriftColor.random(), DriftColor.random(),
        DriftColor.random(), DriftColor.random(), DriftColor.random()
    ]),
    NEVER_SETTLE,
)

export function ColorsReducer(
    state: ColorsState = {
        colors: INITIAL_COLOR_PODGE,
    },
    action: ColorsAction,
): ColorsState {
    if (isAddColor(action))
        state = {
            ...state,
            colors: state.colors.addRandomColor(),
        }
    if (isRemoveColor(action))
        state = {
            ...state,
            colors: state.colors.removeColor(action.x),
        }
    if (isDiverge(action))
        if (!state.colors.settled)
            state = {
                ...state,
                colors: state.colors.disperse(DRIFT),
            }
    return state
}

export const ColorsContainer = connect(
    (state: AppState) => ({...state.colors}),
    (dispatch: Dispatch<ColorsState>) => ({
        onAddColor: () => dispatch(addColorAction()),
        onRemoveColor: (x: number) => dispatch(removeColorAction(x)),
        onDiverge: () => dispatch(divergeAction()),
    }),
    /* tslint:disable:no-any */
    (state: ColorsState, actions: ColorsActions, parentProps: any) => ({
        ...state,
        ...actions,
        displaySize: parentProps.displaySize,
        tick: TICK,
    })
    /* tslint:enable */
)(
    ColorsDiv
)
