import * as React from 'react'

import {CartPair} from '../../../common/CartPair'
import './LocalGameOptions.css'
import {CheckInput, DropdownNumber, NumberInput, SelectNumber} from '../../../common/Inputs'
import {BasicRobot} from '../model/players/BasicRobot'
import {Map} from 'immutable'
import {countHexes, hexesTall, hexesWide} from './HexConstants';
import {minMax} from '../../../common/MathFunctions';
import {MAX_PLAYERS} from '../model/players/Players';

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

// size of hexes
const hexRadii = Map<string, number>([
    ['Tiny', 30],
    ['Small', 45],
    ['Medium', 65],
    ['Large', 90],
    ['Huge', 120],
])

// number of players
const hexesPerPlayer = Map<string, number>([
    ['Tons', 6],
    ['Lots', 12],
    ['Many', 24],
    ['A few', 48],
    ['Not many', 96],
    ['Very few', 192],
    ['None', Infinity],
])

const minRatio = (x: number, y: number): number =>
    Math.min(x / y, y / x)

// find the pair in map whose value's ratio to x is closest to 1
// (aka multiplicative closest match)
// TODO unit tests
const roundToMap = (
    x: number, map: Map<string, number>
): [ string | undefined , number ] => {
    let closest: string | undefined = undefined
    let closestRatio: number = 0
    let valueClosest: number = NaN
    map.forEach((value, key) => {
        const r = minRatio(value, x)
        if (r > closestRatio) {
            closest = key
            closestRatio = r
            valueClosest = value
        }
        // console.log(`${key}: ${value} / ${x} = ${r} — ${closest} ${valueClosest}: ${r}`)
    })
    return [ closest, valueClosest ]
}

const LocalGameOptionsLimits = {
    numRobots: [ 0, 15 ],
    difficulty: [ 0, BasicRobot.MAX_IQ ],
    boardWidth: [ 1, 45 ],
    boardHeight: [ 2, 21 ],
    mountainPercent: [ 0, 50 ],
    tickMillis: [ 1, 9999 ],
    startingPop: [ 0, 999 ],
}

export interface LGOProps {
    localOptions: LocalGameOptions
    displaySize: CartPair

    changeLocalOption: (name: string, n: number) => void
    newGame: () => void
}

export class LocalGameOptionsView extends React.PureComponent<LGOProps> {
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

    // for a given hex radius, how many columns fit?
    hexesWide = (hexRadius: number): number =>
        Math.round(hexesWide(this.props.displaySize.x, hexRadius))

    // for a given hex radius, how many rows fit?
    hexesTall = (hexRadius: number): number =>
        Math.round(hexesTall(this.props.displaySize.y, hexRadius))

    nHexes = (hexRadius: number): number =>
        countHexes(this.hexesWide(hexRadius), this.hexesTall(hexRadius))

    nPlayers = (hexRadius: number, hexesPerPlayer: number): number =>
        hexesPerPlayer === Infinity ? 0
            : minMax(
                this.nHexes(hexRadius) / hexesPerPlayer, 1, MAX_PLAYERS
            )

    // Given current display size, how many hexes does each radius allow?
    nHexesPerRadius = (): Map<string, number> =>
        Map<string, number>(
            hexRadii.entrySeq().map(([name, radius]) =>
                [name, this.nHexes(radius)]))

    nHexesFromProps = (): number =>
        countHexes(
            this.props.localOptions.boardWidth,
            this.props.localOptions.boardHeight)

    // What hex radius gives us the number of hexes closest to the one requested in props?
    closestHexRadiusToMapSize = (): number => {
        const nHexesMap = this.nHexesPerRadius()
        const [ label/*, nHexes */] = roundToMap(
            this.nHexesFromProps(),
            nHexesMap
        )
        if (label) return hexRadii.get(label) as number
        else return NaN // shouldn't happen
    }


    render(): React.ReactNode {
        console.log(this.props.displaySize.toString())
        const optionChanger = (name: string) =>
            (n: number) => this.props.changeLocalOption(name, n)
        const optionToggler = (optionName: string) =>
            () => this.toggleOption(optionName)

        const selectNumber = (
            label: string, option: string, title: string,
            choices: Map<string, number>,
            level: number = 0
        ) => (
            <SelectNumber
                value={this.props.localOptions[option]}
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
            label: string, option: string, title: string, advanced: number = 0
        ) => (
            <CheckInput
                label={label}
                value={this.isOption(option)}
                title={title}
                onToggle={optionToggler(option)}
                onEnter={this.props.newGame}
                blockTabbing={!this.isLevelVisible(advanced)}
            />
        )

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
                <div className="Row">
                    <div className="Level0 Column">
                        {dropdownNumber('Hexes', 'Pixels per hex', hexRadii, this.closestHexRadiusToMapSize())}
                        {selectNumber('Map Size', 'foo', 'Pixels per hex', hexRadii)}
                        {selectNumber('Robots', 'bar', 'Hexes per player', hexesPerPlayer)}
                        {numberInput('Robots', 'numRobots', 'How many AI opponents?')}
                        {numberInput('Difficulty', 'difficulty', 'How smart should those robots be?')}
                        {numberInput('Width', 'boardWidth', 'How many tiles wide?')}
                        {numberInput('Height', 'boardHeight', 'How many tiles tall?')}
                    </div>
                    <div className="Level1 Column">
                        {numberInput('Mountains', 'mountainPercent', 'Percent of the map covered by mountains', 1)}
                        {numberInput('Tick', 'tickMillis', 'Milliseconds between turns', 1)}
                        {checkInput('Fog', 'fog', 'Hide the areas you don\'t control.', 1)}
                        {checkInput('Capitals', 'capitals', 'Kill a player when you capture their home.', 1)}
                    </div>
                    <div className="Level2 Column">
                        {numberInput('', 'startingPop', 'Population of your initial tile.', 2, (
                            <div><span>Starting</span><br/><span>Population</span></div>
                        ))}
                    </div>
                    <div>
                        <button
                            onClick={this.toggleAdvanced}
                            title={[
                                'Show advanced options',
                                'Show more advanced options',
                                'Hide advanced options',
                            ][this.props.localOptions.levelVisible]}
                        >
                            {['>>>', '>>>', '<<<'][this.props.localOptions.levelVisible]}
                        </button>
                    </div>
                </div>
                <div>
                    <button onClick={this.props.newGame}>
                        Start Game
                    </button>
                </div>
            </div>
        )
    }
}