import {ColorPodge} from './ColorPodge';
import {CartPair} from '../common/CartPair';
import {GenericAction} from '../common/GenericAction'

const DRIFT = 5

const INITIAL_COLOR_PODGE = ColorPodge.construct(6, true)

export const initialColorState = (): ColorsState =>
    ({colors: INITIAL_COLOR_PODGE})

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

export type ColorsDispatch = (action: ColorsAction) => void

export type ColorsAction = AddColor | RemoveColor | Diverge | SetColors

const DIVERGE = 'DIVERGE'
type DIVERGE = typeof DIVERGE
interface Diverge extends GenericAction { type: DIVERGE }
const isDiverge = (action: GenericAction): action is Diverge =>
    action.type === DIVERGE
export const divergeAction = (): Diverge  => ({ type: DIVERGE })

const ADD_COLOR = 'ADD_COLOR'
type ADD_COLOR = typeof ADD_COLOR
interface AddColor extends GenericAction { type: ADD_COLOR }
const isAddColor = (action: GenericAction): action is AddColor =>
    action.type === ADD_COLOR
export const addColorAction = (): AddColor => ({ type: ADD_COLOR })

const REMOVE_COLOR = 'REMOVE_COLOR'
type REMOVE_COLOR = typeof REMOVE_COLOR
interface RemoveColor extends GenericAction {
    type: REMOVE_COLOR
    x: number
}
const isRemoveColor = (action: GenericAction): action is RemoveColor =>
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
const isSetColors = (action: GenericAction): action is SetColors =>
    action.type === SET_COLORS
export const setColorsAction = (colors: ColorPodge): SetColors => ({
    type: SET_COLORS,
    colors: colors,
})

export function ColorsReducer(
    state: ColorsState,
    action: GenericAction,
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
