import {SetStateAction} from 'react'
import * as React from 'react'

// parse & check types for compatibility
function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
    const initialString = window.localStorage.getItem(key) || JSON.stringify(defaultValue)
    const result = {...defaultValue}
    try {
        const initialJSON = JSON.parse(initialString)
        for (let k in result)
            // TODO recurse
            // TODO unit test
            // copy each value that is present in the default and also the same type
            // noinspection JSUnfilteredForInLoop
            if (initialJSON.hasOwnProperty(k) && (typeof result[k]) === (typeof initialJSON[k]))
                // noinspection JSUnfilteredForInLoop
                result[k] = initialJSON[k]
    }
    catch (e) {
        console.warn(`Can't parse ${initialString}: ${e}`)
    }
    return result
}

function saveToLocalStorage<T>(key: string, value: T) {
    window.localStorage.setItem(key, JSON.stringify(value))
}

export function useLocalStorageState<S>(key: string, defaultState: S):
    [S, React.Dispatch<SetStateAction<S>>]
{
    const initialState = loadFromLocalStorage(key, defaultState)
    const [state, setState] = React.useState(initialState)
    React.useEffect(() => saveToLocalStorage(key, state))
    return [state, setState]
}