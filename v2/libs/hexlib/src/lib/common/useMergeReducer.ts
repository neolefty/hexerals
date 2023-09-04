import { Dispatch, useCallback, useReducer } from "react"
import merge from "ts-deepmerge"
import { PartialDeep } from "type-fest"

export type MergeDispatch<T> = Dispatch<PartialDeep<T>>
export type ShallowMergeDispatch<T> = Dispatch<Partial<T>>

interface ReducerDefinition<T> {
    (state: T, action: PartialDeep<T>): T
}
interface ShallowReducerDefinition<T> {
    (state: T, action: Partial<T>): T
}

type SomeObject = Record<string, unknown>

const mergeReducer = <T extends SomeObject>(
    state: T,
    action: PartialDeep<T>
): T => merge(state, action) as T
const shallowMergeReducer = <T extends SomeObject>(
    state: T,
    action: Partial<T>
): T =>
    Object.freeze({
        ...state,
        ...action,
    })

export const useMergeReducer = <T extends SomeObject>(
    initialState: T
): [T, MergeDispatch<T>] =>
    useReducer<ReducerDefinition<T>>(mergeReducer, initialState)

export const useShallowMergeReducer = <T extends SomeObject>(
    initialState: T
): [T, ShallowMergeDispatch<T>] =>
    useReducer<ShallowReducerDefinition<T>>(shallowMergeReducer, initialState)

export const useMergeOptionsReducer = <T extends SomeObject>(
    initialState: T,
    options: Partial<{ mergeArrays: boolean }>
): [T, MergeDispatch<T>] => {
    const reducer = useCallback<ReducerDefinition<T>>(
        (state, action) => merge.withOptions(options, state, action) as T,
        [options]
    )
    return useReducer(reducer, initialState)
}
