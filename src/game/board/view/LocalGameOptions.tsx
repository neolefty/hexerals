import * as React from 'react'
import InputRange, {Range as MinMax} from 'react-input-range'
import 'react-input-range/lib/css/index.css'

import {CartPair} from '../../../common/CartPair'
import './LocalGameOptions.css'
import {CheckInput, NumberInput} from '../../../common/Inputs'
import {BasicRobot} from '../model/players/BasicRobot'
import {List, Map} from 'immutable'
import {
    countHexes, widthFromHeight, heightFromWidth,
} from './HexConstants'
import {minMax, roundToMap} from '../../../common/MathFunctions'
import {MAX_PLAYERS} from '../model/players/Players'
import {CacheMap} from '../../../common/CacheMap'

export interface LocalGameOptions {
    // All numbers because our reducer assumes it.
    // If we need a non-number, the reducer should be easy to modify.
    numRobots: number
    tickMillis: number
    boardWidth: number
    boardHeight: number
    mountainPercent: number
    difficulty: number
    startingPop: number

    // booleans
    fog: number
    capitals: number
    levelVisible: number  // advanced options visible?
}

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

const LocalGameOptionsLimits = {
    numRobots: [ 0, 15 ],
    difficulty: [ 0, BasicRobot.MAX_IQ ],
    boardWidth: [ 1, 45 ],
    boardHeight: [ 2, 21 ],
    mountainPercent: [ 0, 50 ],
    tickMillis: [ 1, 9999 ],
    startingPop: [ 0, 999 ],
}

interface HexCounts {
    dimensions: List<CartPair>
    counts: Map<CartPair, number>
}

const hexCountsCache = new CacheMap<CartPair, HexCounts>(20)

export interface LGOProps {
    localOptions: LocalGameOptions
    displaySize: CartPair

    changeLocalOption: (name: string, n: number) => void
    newGame: () => void
}

export class LocalGameOptionsView
    extends React.PureComponent<LGOProps>
{
    private isOption = (optionName: string): boolean =>
        this.props.localOptions[optionName] > 0
    private toggleOption = (optionName: string) =>
        this.props.changeLocalOption(optionName, this.isOption(optionName) ? 0 : 1)

    isLevelVisible = (level: number) =>
        this.props.localOptions.levelVisible >= level

    toggleAdvanced = () =>
        this.props.changeLocalOption(
            'levelVisible',
            (this.props.localOptions.levelVisible + 1) % 3 // 0, 1, 2
        )

    // How many hexes fit, proportionately?
    widthFromHeight = (hexHeight: number): number =>
        widthFromHeight(this.props.displaySize, hexHeight)
    heightFromWidth = (hexWidth: number): number =>
        heightFromWidth(this.props.displaySize, hexWidth)

    getHexCounts = (): HexCounts =>
        hexCountsCache.get(
            this.props.displaySize,
            () => this.computeHexCounts()
        )

    computeHexCounts = (): HexCounts => {
        const map = Map<CartPair, number>().withMutations(
            result => {
                const minWidth = LocalGameOptionsLimits.boardWidth[0]
                const minHeight = LocalGameOptionsLimits.boardHeight[0]
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

    setBoardSize = (wh: CartPair) => {
        this.props.changeLocalOption('boardWidth', wh.x)
        this.props.changeLocalOption('boardHeight', wh.y)
    }

    fitToShape = (hexCount: number) =>
        this.setBoardSize(
            roundToMap(
                hexCount,
                this.getHexCounts().counts,
                new CartPair(10, 10)
            )[0]
        )

    render(): React.ReactNode {
        // TODO move this up, to avoid mutating state in render() ...
        this.fitToShape(this.nHexesFromProps())
        const optionChanger = (name: string) =>
            (n: number) => this.props.changeLocalOption(name, n)
        const optionToggler = (optionName: string) =>
            () => this.toggleOption(optionName)

/*
        const dropdownNumber = (
            label: string,
            title: string,
            choices: Map<string, number>,
            value: number,
            onChange?: (value: number) => void,
            level: number = 0,
            option?: string,
        ) => (
            <DropdownNumber
                value={value}
                choices={choices}
                onChange={
                    onChange ? onChange
                        : option ? optionChanger(option)
                        : (x: number) => console.log(`${label} = ${x}`)
                }
                label={label}
                title={title}
                onEnter={this.props.newGame}
                blockTabbing={!this.isLevelVisible(level)}
            />
        )
*/

        const numberInput = (
            label: string, option: string, title: string,
            level: number = 0, children?: JSX.Element | JSX.Element[],
        ) => (
            <NumberInput
                label={label}
                value={this.props.localOptions[option]}
                title={title}
                min={LocalGameOptionsLimits[option][0]}
                max={LocalGameOptionsLimits[option][1]}
                onChange={optionChanger(option)}
                onEnter={this.props.newGame}
                blockTabbing={!this.isLevelVisible(level)}
                children={children}
            />
        )

        const checkInput = (
            label: string, option: string, title: string, level: number = 0
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
            onChange: (n: number) => void,
            valueLabel: (n: number) => string = n => `${n}`,
            formatLabel?: (n: number) => string,
        ) {
            let [ min, max ] = [ Infinity, -Infinity ]
            choices.forEach(n => {
                min = Math.min(n, min)
                max = Math.max(n, max)
            })
            return numberRange(
                label, title, value, min, max, onChange, formatLabel,
            )
        }

        function numberRange<V>(
            label: string, title: string, value: number,
            min: number, max: number,
            onChange: (n: number) => void,
            valueLabel: (n: number) => string = n => `${n}`,
            formatLabel?: (n: number) => string,
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
                        formatLabel={formatLabel}
                        onChange={(value: number | MinMax) =>
                            onChange(value as number)
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
                            optionChanger('numRobots'),
                            value => roundToMap(
                                this.nHexesFromProps() / value,
                                playerDensities,
                                'None'
                            )[0]
                        )}
                        {numberRange(
                            'Difficulty', 'How smart should these robots be?',
                            this.props.localOptions.difficulty,
                            0, BasicRobot.MAX_IQ,
                            optionChanger('difficulty'),
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