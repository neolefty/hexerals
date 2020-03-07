import React, {Context, ReactNode, useContext} from "react"
import {GenericAction} from "../common/GenericAction"
import {initialMainState, MainDispatch, MainState} from "./MainReducer"

export const MainStateContext: Context<MainState> = React.createContext(initialMainState())

export interface WithMainStateProps {
    state: MainState
    children?: ReactNode
}

export const WithMainState = (props: WithMainStateProps) =>
    <MainStateContext.Provider value={Object.freeze(props.state)}>
        {props.children}
    </MainStateContext.Provider>

export const useMainState = (): MainState => useContext(MainStateContext)

export const DISPATCH_UNIMPLEMENTED_WARN: MainDispatch = (action: GenericAction) => {
    console.warn(`Dispatch not initialized for action ${JSON.stringify(action)}`)
}

export const MainDispatchContext: Context<MainDispatch> = React.createContext(DISPATCH_UNIMPLEMENTED_WARN)

export interface WithMainDispatchProps {
    dispatch: MainDispatch
    children?: ReactNode
}

export const WithMainDispatch = (props: WithMainDispatchProps) =>
    <MainDispatchContext.Provider value={props.dispatch}>
        {props.children}
    </MainDispatchContext.Provider>

// Gain access to the global dispatch, to send updates following the Flux / Redux pattern
export const useMainDispatch = (): MainDispatch => useContext(MainDispatchContext)
