import {ColorPodge} from './ColorPodge';
import {GenericAction} from '../common/App';
import CartPair from '../common/CartPair';

const DRIFT = 5

const INITIAL_COLOR_PODGE = ColorPodge.construct(6, true)

export interface ColorsState {
    colors: ColorPodge
}

export interface ColorsActions {
    onAddColor: () => void
    onRemoveColor: (x: number) => void
    onDiverge: () => void
}

export interface ColorsProps {
    displaySize: CartPair
    tick: number
}

type ColorsAction = AddColor | RemoveColor | Diverge | SetColors

const DIVERGE = 'DIVERGE'
type DIVERGE = typeof DIVERGE
interface Diverge extends GenericAction { type: DIVERGE }
const isDiverge = (action: ColorsAction): action is Diverge =>
    action.type === DIVERGE
export const divergeAction = (): Diverge  => ({ type: DIVERGE })

const ADD_COLOR = 'ADD_COLOR'
type ADD_COLOR = typeof ADD_COLOR
interface AddColor extends GenericAction { type: ADD_COLOR }
const isAddColor = (action: ColorsAction): action is AddColor =>
    action.type === ADD_COLOR
export const addColorAction = (): AddColor => ({ type: ADD_COLOR })

const REMOVE_COLOR = 'REMOVE_COLOR'
type REMOVE_COLOR = typeof REMOVE_COLOR
interface RemoveColor extends GenericAction {
    type: REMOVE_COLOR
    x: number
}
const isRemoveColor = (action: ColorsAction): action is RemoveColor =>
    action.type === REMOVE_COLOR
export const removeColorAction = (x: number): RemoveColor => ({
    type: REMOVE_COLOR,
    x: x,
})

const SET_COLORS = 'SET_COLORS'
type SET_COLORS = typeof SET_COLORS
interface SetColors extends GenericAction {
    type: SET_COLORS
    colors: ColorPodge
}
const isSetColors = (action: ColorsAction): action is SetColors =>
    action.type === SET_COLORS
export const setColorsAction = (colors: ColorPodge): SetColors => ({
    type: SET_COLORS,
    colors: colors,
})

export function ColorsReducer(
    state: ColorsState = {
        colors: INITIAL_COLOR_PODGE,
    },
    action: ColorsAction,
): ColorsState {
    if (isAddColor(action)) state = {
        ...state,
        colors: state.colors.addRandomColor(),
    }
    if (isRemoveColor(action)) state = {
        ...state,
        colors: state.colors.removeColor(action.x),
    }
    if (isDiverge(action))
        if (!state.colors.settled) state = {
            ...state,
            colors: state.colors.disperse(DRIFT),
        }
    if (isSetColors(action)) state = {
        ...state,
        colors: action.colors,
    }
    return state
}