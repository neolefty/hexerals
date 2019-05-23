import * as React from 'react'
import {List, Map} from 'immutable'
import InputRange, {Range as MinMax} from 'react-input-range'
import 'react-input-range/lib/css/index.css'

import {CartPair} from '../../../common/CartPair'
import {CheckInput, NumberInput} from '../../../common/Inputs'
import {CacheMap} from '../../../common/CacheMap'
import {minMax, minRatio, roundToMap} from '../../../common/MathFunctions'
import {BasicRobot} from '../../model/players/BasicRobot'
import {MAX_PLAYERS} from '../../model/players/Players'
import {LocalGameOptions} from '../../model/board/LocalGameOptions'
import {countHexes, heightFromWidth, widthFromHeight} from '../board/HexConstants'
import {statSizesAndStyles} from '../board/BoardAndStats'
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

const MAX_MAP_SIZE = 375
const MIN_MAP_SIZE = 50
const DEFAULT_HEXES_PER_PLAYER = 'A few'
// const DEFAULT_DIFFICULTY = '2'

// number of hexes per player
const playerDensities = Map<string, number>([
    ['Tons', 6],
    ['Lots', 12],
    ['Many', 24],
    [DEFAULT_HEXES_PER_PLAYER, 48],
    ['Not many', 96],
    ['Very few', 192],
    ['None', Infinity],
])

const difficultyNames = Object.freeze([
    'Easy',
    'Basic',
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
    displaySize: CartPair

    changeLocalOption: (
        name: keyof LocalGameOptions, n: number, highFidelity: boolean
    ) => void
    newGame: () => void
}

export class LocalGameOptionsView
    extends React.PureComponent<LGOVProps>
{
    private boardDisplaySize: CartPair = CartPair.ORIGIN
    private isOption = (optionName: LGOKey): boolean =>
        this.props.localOptions[optionName] > 0
    private toggleOption = (optionName: LGOKey) =>
        this.props.changeLocalOption(
            optionName,
            this.isOption(optionName) ? 0 : 1,
            true,
        )

    isLevelVisible = (level: number) =>
        this.props.localOptions.levelVisible >= level

    toggleAdvanced = () =>
        this.props.changeLocalOption(
            'levelVisible',
            (this.props.localOptions.levelVisible + 1) % 3, // 0, 1, 2
            true,
        )

    // How many hexes fit, proportionately?
    widthFromHeight = (hexHeight: number): number =>
        widthFromHeight(this.boardDisplaySize, hexHeight)
    heightFromWidth = (hexWidth: number): number =>
        heightFromWidth(this.boardDisplaySize, hexWidth)

    getHexCounts = (): HexCounts =>
        hexCountsCache.get(
            this.boardDisplaySize,
            () => this.computeHexCounts()
        )

    getOptionLimits = (key: LGOKey): [ number, number ] =>
        LocalGameOptionsLimits.get(key) as [ number, number ]

    computeHexCounts = (): HexCounts => {
        const map = Map<CartPair, number>().withMutations(
            result => {
                const minWidth = this.getOptionLimits('boardWidth')[0]
                const minHeight = this.getOptionLimits('boardHeight')[0]
                {
                    let w = minWidth
                    let hexCount = 0;
                    while (hexCount < MAX_MAP_SIZE) {
                        const h = this.heightFromWidth(w)
                        if (h >= minHeight) {
                            hexCount = countHexes(w, h)
                            if (hexCount >= MIN_MAP_SIZE) {
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
                    while (hexCount < MAX_MAP_SIZE) {
                        const w = this.widthFromHeight(h)
                        if (w >= minWidth) {
                            hexCount = countHexes(w, h)
                            if (hexCount >= MIN_MAP_SIZE) {
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

    nPlayers = (nHexes: number, hexesPerPlayer: number): number =>
        hexesPerPlayer === Infinity ? 1
            : minMax(
                // always at least one opponent unless "None" is selected
                nHexes / hexesPerPlayer, 2, MAX_PLAYERS
            )

    nHexesFromProps = (): number =>
        countHexes(
            this.props.localOptions.boardWidth,
            this.props.localOptions.boardHeight)

    // map of player density name ("Lots", "Very Few", etc) to total number of players
    playerCountMap = (): Map<string, number> =>
        playerDensities.mapEntries(([label, density]) =>
            [label, this.nPlayers(this.nHexesFromProps(), density)]
        )

    // What robot density gives us the number of robots closest to the one requested in props?
    closestPlayerDensity = (): number =>
        playerDensities.get(
            roundToMap(
                this.props.localOptions.numRobots + 1,
                this.playerCountMap(),
                DEFAULT_HEXES_PER_PLAYER,
            )[0]
        ) as number

    setBoardSize = (wh: CartPair, highFidelity: boolean) => {
        // order not preserved — if 1st is low fidelity, it may overwrite 2nd
        this.props.changeLocalOption('boardWidth', wh.x, highFidelity)
        this.props.changeLocalOption('boardHeight', wh.y, highFidelity)
    }

    nearestBoardSize(hexCount: number): CartPair {
        return roundToMap(
            hexCount,
            this.getHexCounts().counts,
            new CartPair(10, 10)
        )[0]
    }

    // Are the current hex proportions a close enough fit to the window?
    // margin of 0 means must be exact match; .1 means within 10%, etc.
    shapeMatches(margin: number = 0.2): boolean {
        const wh = this.nearestBoardSize(this.nHexesFromProps())
        // Divide margin by 2 - margin is extra forgiving because it's kinda operating on geometric mean instead of what you'd expect, since x and y are proportional to square root of number of hexes.
        const ratio = (1 - margin / 2)
        const xRatio = minRatio(wh.x, this.props.localOptions.boardWidth)
        const yRatio = minRatio(wh.y, this.props.localOptions.boardHeight)
        return (
            xRatio >= ratio && yRatio >= ratio
        )
    }

    fitToShape = (hexCount: number, highFidelity: boolean) => {
        // console.log(`set board size to ${hexCount} hexes — ${highFidelity ? 'high' : 'low'} fidelity`)
        this.setBoardSize(
            this.nearestBoardSize(hexCount), highFidelity
        )
    }

    render(): React.ReactNode {
        this.boardDisplaySize = statSizesAndStyles(
            this.props.displaySize, this.props.localOptions.statsVisible !== 0
        ).board.displaySize
        // TODO move this up to parent, to avoid mutating state in render() ...
        if (!this.shapeMatches())
            this.fitToShape(this.nHexesFromProps(), true)

        const optionChanger = (
            name: keyof LocalGameOptions, forceHighFi = false
        ) => (n: number, highFidelity: boolean = true) =>
            this.props.changeLocalOption(name, n, highFidelity || forceHighFi)
        const optionToggler = (optionName: LGOKey) =>
            () => this.toggleOption(optionName)

        const numberInput = (
            label: string, option: LGOKey, title: string,
            level: number = 0, children?: JSX.Element | JSX.Element[],
        ) => (
            <NumberInput
                label={label}
                value={this.props.localOptions[option]}
                title={title}
                min={this.getOptionLimits(option)[0]}
                max={this.getOptionLimits(option)[1]}
                onChange={optionChanger(option)}
                onEnter={this.props.newGame}
                blockTabbing={!this.isLevelVisible(level)}
                children={children}
            />
        )

        // TODO Replace with toggle button — grey when inactive
        const checkInput = (
            label: string, option: LGOKey, title: string, level: number = 0
        ) => (
            <CheckInput
                label={label}
                value={this.isOption(option)}
                title={title}
                onToggle={optionToggler(option)}
                onEnter={this.props.newGame}
                blockTabbing={!this.isLevelVisible(level)}
            />
        )

        function numberRangeFromMap<V>(
            label: string, title: string, value: number,
            choices: Map<V, number>,
            onChange: (n: number, highFidelity: boolean) => void,
        ) {
            let [ min, max ] = [ Infinity, -Infinity ]
            choices.forEach(n => {
                min = Math.min(n, min)
                max = Math.max(n, max)
            })
            return numberRange(label, title, value, min, max, onChange)
        }

        function numberRange<V>(
            label: string, title: string, value: number,
            min: number, max: number,
            onChange: (n: number, highFidelity: boolean) => void,
        ) {
            return (
                <label
                    className="InputRange Row"
                    title={title}
                >
                    <span className="Label">
                        {label}
                    </span>
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
                </label>
            )
        }

        return (
            <div
                className={`LocalGameOptionsView Column Show${
                    this.props.localOptions.levelVisible
                }`}
                style={this.props.displaySize.sizeStyle}
            >
                <div className="Modal Column">
                    <div className="Level0 Column">
                        {numberRangeFromMap(
                            'Map',
                            'How big of a map?',
                            this.nHexesFromProps(),
                            this.getHexCounts().counts,
                            this.fitToShape,
                        )}
                        {numberRange(
                            'Robots', 'How many AI opponents?',
                            this.props.localOptions.numRobots,
                            0, MAX_PLAYERS - 1,
                            optionChanger('numRobots', true),
                        )}
                        {numberRange(
                            difficultyNames[this.props.localOptions.difficulty],
                            'How smart should these robots be?',
                            this.props.localOptions.difficulty,
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
                            onClick={this.props.newGame}
                            className='start'
                        >
                            Start
                        </button>
                        <button
                            className="LevelButton"
                            onClick={this.toggleAdvanced}
                            title={[
                                'More Options',
                                'Even More Options',
                                'Hide Options',
                            ][this.props.localOptions.levelVisible]}
                        >
                            {['...', '...', '...'][this.props.localOptions.levelVisible]}
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}