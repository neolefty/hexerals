export const isIOS = (): boolean => {
    return !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)
}