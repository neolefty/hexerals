import {isMobileOnly} from 'react-device-detect'

export const isIOS = (): boolean => {
    return !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)
}

export const isPhone = (): boolean => {
    try {
        return isMobileOnly // isMobile would include tablets
    }
    catch (e) {
        console.warn(`Can't detect device: ${e}; assuming non-phone.`)
        return false
    }
}