import {LocalGameOptions} from "./LocalGameOptions"

const STORE_KEY = "localGameOptions"

export const restoreLocalGameOptions = (): Partial<LocalGameOptions> => {
    const saved = localStorage.getItem(STORE_KEY)
    if (saved) {
        try {
            // console.log(JSON.parse(saved))
            return JSON.parse(saved)
        } catch (e) {
            console.error(e)
            console.log('clearing local game option storage due to parse error')
            localStorage.removeItem(STORE_KEY)
        }
    }
    return {}
}

export const saveLocalGameOptions = (opts: Partial<LocalGameOptions>) => {
    localStorage.setItem(STORE_KEY, JSON.stringify(opts))
}
