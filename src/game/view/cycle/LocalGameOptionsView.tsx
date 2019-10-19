import {List, Map} from 'immutable'
import * as React from 'react'
import InputRange, {Range as MinMax} from 'react-input-range'
import 'react-input-range/lib/css/index.css'
import {isPhone} from '../../../common/BrowserUtil'
import {CacheMap} from '../../../common/CacheMap'

import {CartPair} from '../../../common/CartPair'
import {CheckInput, NumberInput} from '../../../common/Inputs'
import {minRatio, roundToMap} from '../../../common/MathFunctions'
import {useDisplaySize} from "../../../common/ViewSizeContext"
import {LocalGameOptions} from '../../model/board/LocalGameOptions'
import {BasicRobot} from '../../model/players/BasicRobot'
import {MAX_PLAYERS} from '../../model/players/Players'
import {statSizesAndStyles} from '../board/BoardAndStats'
import {countHexes, heightFromWidth, widthFromHeight} from '../hex/HexConstants'
import './LocalGameOptionsView.css'

// export type LGOKey =
//     'numRobots' | 'tickMillis' | 'boardWidth' | 'boardHeight'
//     | 'mountainPercent' | 'difficulty' | 'startingPop' | 'fog' | 'capitals'
//     | 'levelVisible'

// export enum LGOKey {
//     numRobots = 'numRobots',
//     tickMillis = 'tickMillis',
//     boardWidth = 'boardWidth',
//     boardHeight = 'boardHeight',
//     mountainPercent = 'mountainPercent',
//     difficulty = 'difficulty',
//     startingPop = 'startingPop',
//     fog = 'fog',
//     capitals = 'capitals',
//     levelVisible = 'levelVisible',
// }

const MIN_MAP_SIZE = 50
// const DEFAULT_HEXES_PER_PLAYER = 'A few'

// hexes can get too small, especially for touch
// but this doesn't work very well because browsers report such a wide variety of resolutions
const MIN_PIXELS_PER_HEX = 800

// this seems like an over simplification, but I haven't found anything better.
// note that tablets get the higher number
const maxMapSize = (): number => isPhone() ? 250 : 400

// const DEFAULT_DIFFICULTY = '2'

// number of hexes per player
// const playerDensities = Map<string, number>([
//     ['Tons', 6],
//     ['Lots', 12],
//     ['Many', 24],
//     [DEFAULT_HEXES_PER_PLAYER, 48],
//     ['Not many', 96],
//     ['Very few', 192],
//     ['None', Infinity],
// ])

const difficultyNames = Object.freeze([
    'Easy',
    'Basic',
    'Medium',
    'Medium',
    'Tough',
    'Hard',
])

// "Index types" — typescriptlang.org/docs/handbook/advanced-types.html
type LGOKey = keyof LocalGameOptions

const LocalGameOptionsLimits =
    Map<LGOKey, [number, number]>([
        ['numRobots', [ 0, 15 ]],
        ['difficulty', [ 0, BasicRobot.MAX_IQ ]],
        ['boardWidth', [ 1, 45 ]],
        ['boardHeight', [ 2, 21 ]],
        ['mountainPercent', [ 0, 50 ]],
        ['tickMillis', [ 1, 9999 ]],
        ['startingPop', [ 0, 999 ]],
        ['roundTicks', [ 1, 9999 ]],
    ])

interface HexCounts {
    dimensions: List<CartPair>
    counts: Map<CartPair, number>
}

const hexCountsCache = new CacheMap<CartPair, HexCounts>(20)

export interface LGOVProps {
    localOptions: LocalGameOptions

    changeLocalOption: (
        name: keyof LocalGameOptions, n: number, highFidelity: boolean
    ) => void
    newGame: () => void
}

export const LocalGameOptionsView = (props: LGOVProps) => {
    const displaySize = useDisplaySize()
    const boardDisplaySize = statSizesAndStyles(
        displaySize, props.localOptions.statsVisible !== 0
    ).board.displaySize

    const isOption = (optionName: LGOKey): boolean => props.localOptions[optionName] > 0
    const isLevelVisible = (level: number) => props.localOptions.levelVisible >= level

    const toggleOption = (optionName: LGOKey) =>
        props.changeLocalOption(
            optionName,
            isOption(optionName) ? 0 : 1,
            true,
        )

    const toggleAdvanced = () =>
        props.changeLocalOption(
            'levelVisible',
            (props.localOptions.levelVisible + 1) % 3, // 0, 1, 2
            true,
        )

    // How many hexes fit, proportionately?
    const wFromH = (hexHeight: number): number =>
        widthFromHeight(boardDisplaySize, hexHeight)
    const hFromW = (hexWidth: number): number =>
        heightFromWidth(boardDisplaySize, hexWidth)

    const getHexCounts = (): HexCounts =>
        hexCountsCache.get(
            boardDisplaySize,
            () => computeHexCounts()
        )

    const getOptionLimits = (key: LGOKey): [ number, number ] =>
        LocalGameOptionsLimits.get(key) as [ number, number ]

    const computeHexCounts = (): HexCounts => {
        const map = Map<CartPair, number>().withMutations(
            result => {
                const minWidth = getOptionLimits('boardWidth')[0]
                const minHeight = getOptionLimits('boardHeight')[0]
                {
                    let w = minWidth
                    let hexCount = 0;
                    while (hexCount < maxMapSize()) {
                        const h = hFromW(w)
                        if (h >= minHeight) {
                            hexCount = countHexes(w, h)
                            const pixelsPerHex = displaySize.product / hexCount
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
                    let hexCount = 0;
                    while (hexCount < maxMapSize()) {
                        const w = wFromH(h)
                        if (w >= minWidth) {
                            hexCount = countHexes(w, h)
                            const pixelsPerHex = displaySize.product / hexCount
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
        return { dimensions: list, counts: map }
    }

    const nHexesFromProps = (): number =>
        countHexes(props.localOptions.boardWidth, props.localOptions.boardHeight)

    // const nPlayers = (nHexes: number, hexesPerPlayer: number): number =>
    //     hexesPerPlayer === Infinity ? 1
    //         : minMax(
    //             // always at least one opponent unless "None" is selected
    //             nHexes / hexesPerPlayer, 2, MAX_PLAYERS
    //         )
    //
    // map of player density name ("Lots", "Very Few", etc) to total number of players
    // const playerCountMap = (): Map<string, number> =>
    //     playerDensities.mapEntries(([label, density]) =>
    //         [label, nPlayers(nHexesFromProps(), density)]
    //     )
    //
    // What robot density gives us the number of robots closest to the one requested in props?
    // const closestPlayerDensity = (): number =>
    //     playerDensities.get(
    //         roundToMap(
    //             props.localOptions.numRobots + 1,
    //             playerCountMap(),
    //             DEFAULT_HEXES_PER_PLAYER,
    //         )[0]
    //     ) as number

    const setBoardSize = (wh: CartPair, highFidelity: boolean) => {
        // order not preserved — if 1st is low fidelity, it may overwrite 2nd
        props.changeLocalOption('boardWidth', wh.x, highFidelity)
        props.changeLocalOption('boardHeight', wh.y, highFidelity)
    }

    const nearestBoardSize = (hexCount: number): CartPair =>
        roundToMap(
            hexCount,
            getHexCounts().counts,
            new CartPair(10, 10)
        )[0]

    // Are the current hex proportions a close enough fit to the window?
    // margin of 0 means must be exact match; .1 means within 10%, etc.
    const shapeMatches = (margin: number = 0.2): boolean => {
        const wh = nearestBoardSize(nHexesFromProps())
        // Divide margin by 2 - margin is extra forgiving because it's kinda operating on geometric mean instead of what you'd expect, since x and y are proportional to square root of number of hexes.
        const ratio = (1 - margin / 2)
        const xRatio = minRatio(wh.x, props.localOptions.boardWidth)
        const yRatio = minRatio(wh.y, props.localOptions.boardHeight)
        return (
            xRatio >= ratio && yRatio >= ratio
        )
    }

    const fitToShape = (hexCount: number, highFidelity: boolean) => {
        // console.log(`set board size to ${hexCount} hexes — ${highFidelity ? 'high' : 'low'} fidelity`)
        setBoardSize(nearestBoardSize(hexCount), highFidelity)
    }

    // TODO move this up to parent, to avoid mutating state in render() ...
    if (!shapeMatches())
        fitToShape(nHexesFromProps(), true)

    const optionChanger = (
        name: keyof LocalGameOptions, forceHighFi = false
    ) => (n: number, highFidelity: boolean = true) =>
        props.changeLocalOption(name, n, highFidelity || forceHighFi)
    const optionToggler = (optionName: LGOKey) =>
        () => toggleOption(optionName)

    const numberInput = (
        label: string, option: LGOKey, title: string,
        level: number = 0, children?: JSX.Element | JSX.Element[],
    ) => (
        <NumberInput
            label={label}
            value={props.localOptions[option]}
            title={title}
            min={getOptionLimits(option)[0]}
            max={getOptionLimits(option)[1]}
            onChange={optionChanger(option)}
            onEnter={props.newGame}
            blockTabbing={!isLevelVisible(level)}
            children={children}
        />
    )

    // TODO Replace with toggle button — grey when inactive
    const checkInput = (
        label: string, option: LGOKey, title: string, level: number = 0
    ) => (
        <CheckInput
            label={label}
            value={isOption(option)}
            title={title}
            onToggle={optionToggler(option)}
            onEnter={props.newGame}
            blockTabbing={!isLevelVisible(level)}
        />
    )

    function numberRangeFromMap<V>(
        labelBefore: string,
        labelAfter: (value: number) => string,
        title: string, value: number,
        choices: Map<V, number>,
        onChange: (n: number, highFidelity: boolean) => void,
    ) {
        let [ min, max ] = [ Infinity, -Infinity ]
        choices.forEach(n => {
            min = Math.min(n, min)
            max = Math.max(n, max)
        })
        return numberRange(labelBefore, labelAfter, title, value, min, max, onChange)
    }

    function numberRange<V>(
        labelBefore: string, labelAfter: (value: number) => string,
        title: string, value: number,
        min: number, max: number,
        onChange: (n: number, highFidelity: boolean) => void,
    ) {
        // console.log(`${labelBefore} ${value} — ${labelAfter(value)} — ${min} - ${max}`)
        return (
            <label
                className="InputRange Row"
                title={title}
            >
                <span className="LabelBefore">{labelBefore}</span>
                <InputRange
                    minValue={min}
                    maxValue={max}
                    value={value}
                    formatLabel={() => ''}
                    onChangeComplete={(value: number | MinMax) =>
                        onChange(value as number, true)
                    }
                    onChange={(value: number | MinMax) =>
                        onChange(value as number, false)
                    }
                />
                <span className="LabelAfter">{labelAfter(value)}</span>
            </label>
        )
    }

    // const pixelsPer = Math.round(this.props.displaySize.product / this.nHexesFromProps())
    const showSize = nearestBoardSize(nHexesFromProps()).scaleXY(1, 0.5).round()
    return (
        <div
            className={`LocalGameOptionsView Column Show${
                props.localOptions.levelVisible
            }`}
            style={displaySize.sizeStyle}
        >
            <div className="Modal Column">
                <div className="Level0 Column">
                    {numberRangeFromMap(
                        'Map',
                        value => `${showSize.toString(' x ')}`, // ${pixelsPer} ${this.nHexesFromProps()}`,
                        // value => this.nearestBoardSize(value).toString(' x '),
                        'How big of a map?',
                        nHexesFromProps(),
                        getHexCounts().counts,
                        fitToShape,
                    )}
                    {numberRange(
                        'Robots',
                        value => `${value}`,
                        'How many AI opponents?',
                        props.localOptions.numRobots,
                        0, MAX_PLAYERS - 1,
                        optionChanger('numRobots', true),
                    )}
                    {numberRange(
                        'Difficulty',
                        value => difficultyNames[value],
                        'How smart should these robots be?',
                        props.localOptions.difficulty,
                        0, BasicRobot.MAX_IQ,
                        optionChanger('difficulty', true),
                    )}
                </div>
                <div className="Level1 Column">
                    {numberInput('Mountains', 'mountainPercent', 'Percent of the map covered by mountains', 1)}
                    {numberInput('Tick', 'tickMillis', 'Milliseconds between turns', 1)}
                    {checkInput('Fog', 'fog', 'Hide the areas you don\'t control.', 1)}
                    {checkInput('Capitals', 'capitals', 'Kill a player when you capture their home.', 1)}
                </div>
                <div className="Level2 Column">
                    {numberInput('Starting Population', 'startingPop', 'Population of your initial tile.', 2)}
                    {numberInput('Ticks per round', 'roundTicks', 'How often population increases in regular hexes.', 2)}
                    {checkInput('Synced Growth', 'syncedGrowth', 'Pop grows all at once?', 2)}
                    {checkInput('Stats', 'statsVisible', 'Show the stats panel.', 2)}
                </div>
                <div>
                    <button
                        onClick={props.newGame}
                        className='start'
                    >
                        Start
                    </button>
                    <button
                        className="LevelButton"
                        onClick={toggleAdvanced}
                        title={[
                            'More Options',
                            'Even More Options',
                            'Hide Options',
                        ][props.localOptions.levelVisible]}
                    >
                        {['...', '...', '...'][props.localOptions.levelVisible]}
                    </button>
                </div>
            </div>
        </div>
    )
}
