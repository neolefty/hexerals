import * as React from 'react'
import InputRange, {Range as MinMax} from 'react-input-range'
import 'react-input-range/lib/css/index.css'

import {CartPair} from '../../../common/CartPair'
import './LocalGameOptions.css'
import {CheckInput, DropdownNumber, NumberInput, SelectNumber} from '../../../common/Inputs'
import {BasicRobot} from '../model/players/BasicRobot'
import {List, Map, Range} from 'immutable'
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

const DEFAULT_MAP_SIZE = 'Medium'
const MAX_MAP_SIZE = 375
const MIN_MAP_SIZE = 75
const DEFAULT_HEXES_PER_PLAYER = 'A few'
// const DEFAULT_DIFFICULTY = '2'

// number of hexes in map
const mapSizes = Map<string, number>([
    ['Tiny', MIN_MAP_SIZE],
    ['Small', 110],
    [DEFAULT_MAP_SIZE, 165],
    ['Large', 250],
    ['Huge', MAX_MAP_SIZE],
])

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

const difficulties = Map<string, number>(
    Range(0, BasicRobot.MAX_IQ + 1).map(
        iq => [`${iq}`, iq]
    )
)

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
                                console.log(`${w} x ${h} —> ${hexCount}`)
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
                nHexes / hexesPerPlayer, 1, MAX_PLAYERS
            )

    nHexesFromProps = (): number =>
        countHexes(
            this.props.localOptions.boardWidth,
            this.props.localOptions.boardHeight)

    // What map size gives us the number of hexes closest to the one requested in props?
    closestMapSize = (): number =>
        mapSizes.get(
            roundToMap(
                this.nHexesFromProps(), mapSizes, DEFAULT_MAP_SIZE,
            )[0]
        ) as number

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

    render(): React.ReactNode {
        const optionChanger = (name: string) =>
            (n: number) => this.props.changeLocalOption(name, n)
        const optionToggler = (optionName: string) =>
            () => this.toggleOption(optionName)

        const selectNumber = (
            label: string, title: string, value: number,
            choices: Map<string, number>,
            level: number = 0
        ) => (
            <SelectNumber
                value={value}
                choices={choices}
                onChange={
                    // optionChanger(option)
                    (x: number) => console.log(`${label} = ${x}`)
                }
                label={label}
                title={title}
                onEnter={this.props.newGame}
                blockTabbing={!this.isLevelVisible(level)}
            />
        )

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

        const setBoardSize = (wh: CartPair) => {
            this.props.changeLocalOption('boardWidth', wh.x)
            this.props.changeLocalOption('boardHeight', wh.y)
        }

        return (
            <div
                className={`LocalGameOptionsView Column Show${
                    this.props.localOptions.levelVisible
                }`}
                style={{
                    width: this.props.displaySize.x,
                    height: this.props.displaySize.y,
                }}
            >
                <div className="Main">
                    <div className="Row">
                        <div className="Level0 Column">
                            <InputRange
                                minValue={Math.min(this.nHexesFromProps(), MIN_MAP_SIZE)}
                                maxValue={Math.max(this.nHexesFromProps(), MAX_MAP_SIZE)}
                                value={this.nHexesFromProps()}
                                formatLabel={value => `${value} hexes`}
                                onChange={(value: number | MinMax) => {
                                    const n = value as number
                                    const wh = roundToMap(n, this.getHexCounts().counts, new CartPair(10, 10))[0]
                                    setBoardSize(wh)
                                }}
                            />
                            {dropdownNumber('Map', 'How big of a map?', mapSizes, this.closestMapSize())}
                            {dropdownNumber(
                                'Robots',
                                'How many AI opponents?',
                                playerDensities,
                                this.closestPlayerDensity(),
                                density => {
                                    const nPlayers = this.nPlayers(this.nHexesFromProps(), density)
                                    this.props.changeLocalOption('numRobots', nPlayers - 1)
                                }
                            )}
                            {dropdownNumber('Difficulty', 'How smart should those robots be?', difficulties, this.props.localOptions.difficulty, undefined, 0, 'difficulty')}
                        </div>
                        <div className="Level1 Column">
                            {numberInput('Mountains', 'mountainPercent', 'Percent of the map covered by mountains', 1)}
                            {numberInput('Tick', 'tickMillis', 'Milliseconds between turns', 1)}
                            {checkInput('Fog', 'fog', 'Hide the areas you don\'t control.', 1)}
                            {checkInput('Capitals', 'capitals', 'Kill a player when you capture their home.', 1)}
                        </div>
                        <div className="Level2 Column">
                            {selectNumber('Map Size', 'How big of a map?', this.closestMapSize(), mapSizes, 2)}
                            {selectNumber('Robots', 'How many AI opponents?', this.closestPlayerDensity(), playerDensities, 2)}
                            {numberInput('Difficulty', 'difficulty', 'How smart should those robots be?', 2)}
                            {numberInput('', 'startingPop', 'Population of your initial tile.', 2, (
                                <div><span>Starting</span><br/><span>Population</span></div>
                            ))}
                        </div>
                        <div>
                            <button
                                onClick={this.toggleAdvanced}
                                title={[
                                    'Advanced',
                                    'Advanced-er',
                                    'Basic',
                                ][this.props.localOptions.levelVisible]}
                            >
                                {['>>>', '>>>', '<<<'][this.props.localOptions.levelVisible]}
                            </button>
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={this.props.newGame}
                            className='start'
                        >
                            Start
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}