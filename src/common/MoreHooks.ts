import {SetStateAction} from 'react'
import * as React from 'react'

function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
    const initialString = window.localStorage.getItem(key) || JSON.stringify(defaultValue)
    const result = defaultValue
    try {
        const initialJSON = JSON.parse(initialString)
        for (let k in result)
            if (initialJSON.hasOwnProperty(k))
            // TODO parse using typeof(defaultState[k]) or something, to ensure value is the right type
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