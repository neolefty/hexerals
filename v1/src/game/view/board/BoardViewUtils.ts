import {List, Map} from "immutable"
import {CacheMap} from "../../../common/CacheMap"
import {CartPair} from "../../../common/CartPair"
import {minRatio, roundToMap} from "../../../common/MathFunctions"
import {LGO_LIMITS, LGOKey, maxMapSize, MIN_MAP_SIZE, MIN_PIXELS_PER_HEX} from "../../model/board/LocalGameOptions"
import {ChangePreviewOption} from "../cycle/LocalGameOptionsView"
import {countHexes, heightFromWidth, widthFromHeight} from "../hex/HexConstants"
import {statSizesAndStyles} from "./BoardAndStats"

export interface HexCounts {
    dimensions: List<CartPair>
    counts: Map<CartPair, number>
}

const hexCountsCache = new CacheMap<CartPair, HexCounts>(20)

export const boardViewUtils = (displaySize: CartPair, statsVisible: boolean): HexCounts => {
    const boardDisplaySize = statSizesAndStyles(
        displaySize, statsVisible
    ).board.displaySize

    return hexCountsCache.get(
        boardDisplaySize,
        () => computeHexCounts(statsVisible, boardDisplaySize)
    )
}

export const getOptionLimits = (key: LGOKey): [number, number] =>
    LGO_LIMITS.get(key) as [number, number]

const computeHexCounts = (statsVisible: boolean, boardDisplaySize: CartPair): HexCounts => {

    // How many hexes fit, proportionately?
    const wFromH = (hexHeight: number): number =>
        widthFromHeight(boardDisplaySize, hexHeight)
    const hFromW = (hexWidth: number): number =>
        heightFromWidth(boardDisplaySize, hexWidth)

    const map = Map<CartPair, number>().withMutations(
        result => {
            const minWidth = getOptionLimits('boardWidth')[0]
            const minHeight = getOptionLimits('boardHeight')[0]
            {
                let w = minWidth
                let hexCount = 0
                while (hexCount < maxMapSize()) {
                    const h = hFromW(w)
                    if (h >= minHeight) {
                        hexCount = countHexes(w, h)
                        const pixelsPerHex = boardDisplaySize.product / hexCount
                        if (
                            hexCount >= MIN_MAP_SIZE
                            && pixelsPerHex >= MIN_PIXELS_PER_HEX
                        ) {
                            result.set(new CartPair(w, h), hexCount)
                            // console.log(`${w} x ${h} —> ${hexCount}`)
                        }
                    }
                    ++w
                }
            }
            {
                let h = minHeight
                let hexCount = 0
                while (hexCount < maxMapSize()) {
                    const w = wFromH(h)
                    if (w >= minWidth) {
                        hexCount = countHexes(w, h)
                        const pixelsPerHex = boardDisplaySize.product / hexCount
                        if (
                            hexCount >= MIN_MAP_SIZE
                            && pixelsPerHex >= MIN_PIXELS_PER_HEX
                        ) {
                            result.set(new CartPair(w, h), hexCount)
                            // console.log(`${w} x ${h} —> ${hexCount}`)
                        }
                    }
                    ++h
                }
            }
        }
    )
    const list = List<CartPair>(map.keySeq().sort((a, b) =>
        map.get(a, NaN) - map.get(b, NaN)
    ))
    return {dimensions: list, counts: map}
}

export const nearestBoardSize = (displaySize: CartPair, hexCount: number, statsVisible: boolean): CartPair =>
    roundToMap(
        hexCount,
        boardViewUtils(displaySize, statsVisible).counts,
        new CartPair(10, 10)
    )[0]

const setBoardSize = (wh: CartPair, highFidelity: boolean, change: ChangePreviewOption) => {
    // order not preserved — if 1st is low fidelity, it may overwrite 2nd
    change('boardWidth', wh.x, highFidelity)
    change('boardHeight', wh.y, highFidelity)
}

// how tightly do we fit the board to respond to size changes
const FIT_BOARD_SLOP = 0.2

// Are the current hex proportions a close enough fit to the window?
// margin of 0 means must be exact match; .1 means within 10%, etc.
export const shapeNeedsToChange = (
    displaySize: CartPair, boardSize: CartPair, nHexes: number, statsVisible: boolean
): boolean => {
    const nearestBoardWh = nearestBoardSize(displaySize, nHexes, statsVisible)
    // Divide slop by 2 - slop is extra forgiving because it's kinda operating on geometric mean instead of what you'd expect, since x and y are proportional to square root of number of hexes.
    const ratio = (1 - FIT_BOARD_SLOP / 2)
    const xRatio = minRatio(nearestBoardWh.x, boardSize.x)
    const yRatio = minRatio(nearestBoardWh.y, boardSize.y)
    return (
        xRatio < ratio || yRatio < ratio
    )
}

// fit the board shape to the display shape
export const fitToDisplay = (
    displaySize: CartPair,
    hexCount: number,
    highFidelity: boolean,
    statsVisible: boolean,
    change: ChangePreviewOption,
) => {
    // console.log(`set board size to ${hexCount} hexes — ${highFidelity ? 'high' : 'low'} fidelity`)
    setBoardSize(
        nearestBoardSize(displaySize, hexCount, statsVisible),
        highFidelity,
        change,
    )
}
