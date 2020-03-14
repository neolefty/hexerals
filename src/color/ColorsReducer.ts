import {CartPair} from '../common/CartPair'
import {GenericAction} from '../common/GenericAction'
import {ColorPodge} from './ColorPodge'

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

export const isColorsAction = (action: GenericAction): action is ColorsAction =>
    action.type.startsWith('colors ')

const DIVERGE = 'colors diverge'
interface Diverge extends GenericAction { type: typeof DIVERGE }
export const divergeAction = (): Diverge  => ({ type: DIVERGE })

const ADD_COLOR = 'colors add color'
interface AddColor extends GenericAction { type: typeof ADD_COLOR }
export const addColorAction = (): AddColor => ({ type: ADD_COLOR })

const REMOVE_COLOR = 'colors remove color'
interface RemoveColor extends GenericAction {
    type: typeof REMOVE_COLOR
    x: number
}
export const removeColorAction = (x: number): RemoveColor => ({
    type: REMOVE_COLOR,
    x: x,
})

const SET_COLORS = 'colors set'
interface SetColors extends GenericAction {
    type: typeof SET_COLORS
    colors: ColorPodge
}
export const setColorsAction = (colors: ColorPodge): SetColors => ({
    type: SET_COLORS,
    colors: colors,
})

export function ColorsReducer(
    state: ColorsState,
    action: ColorsAction,
): ColorsState {
    switch(action.type) {
        case ADD_COLOR:
            return {...state, colors: state.colors.addRandomColor()}
        case REMOVE_COLOR:
            return {...state, colors: state.colors.removeColor(action.x)}
        case DIVERGE:
            return {...state, colors: state.colors.disperse(DRIFT)}
        case SET_COLORS:
            return {...state, colors: action.colors}
    }
}
