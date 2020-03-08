import {Map} from 'immutable'
import * as React from "react"
import {useEffect, useMemo} from "react"
import 'react-input-range/lib/css/index.css'
import {CartPair} from "../../../common/CartPair"
import {CheckInput, NumberInput} from '../../../common/Inputs'
import {useDisplaySize} from "../../../common/ViewSizeContext"
import {LGO_DIFFICULTY_NAMES, LGOKey, LocalGameOptions} from '../../model/board/LocalGameOptions'
import {BasicRobot} from '../../model/players/BasicRobot'
import {MAX_PLAYERS} from '../../model/players/Players'
import {
    boardHexCounts,
    fitToDisplay,
    getOptionLimits,
    nearestBoardSize,
    shapeNeedsToChange
} from "../fitToDisplay.ts/boardHexCounts"
import {countHexes} from '../hex/HexConstants'
import './LocalGameOptionsView.css'
import {MakeInputRange} from "./MakeInputRange"

export type ChangePreviewOption = (
    name: keyof LocalGameOptions, n: number, highFidelity: boolean
) => void

export interface LGOVProps {
    localOptions: LocalGameOptions
    changeLocalOption: ChangePreviewOption
    newGame: () => void
}

export const LocalGameOptionsView = (props: LGOVProps) => {
    const displaySize = useDisplaySize()
    const nHexes = countHexes(props.localOptions.boardWidth, props.localOptions.boardHeight)
    const statsVisible = props.localOptions.statsVisible !== 0
    const changeOption = props.changeLocalOption
    const boardSize = useMemo<CartPair>(
        () => new CartPair(props.localOptions.boardWidth, props.localOptions.boardHeight),
        [props.localOptions.boardWidth, props.localOptions.boardHeight],
    )

    useEffect(() => {
        if (shapeNeedsToChange(displaySize, boardSize, nHexes, statsVisible))
            fitToDisplay(displaySize, nHexes, true, statsVisible, changeOption)
    }, [displaySize, boardSize, nHexes, statsVisible, changeOption])

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
        return MakeInputRange(labelBefore, labelAfter, title, value, min, max, onChange)
    }

    // const pixelsPer = Math.round(this.props.displaySize.product / this.nHexesFromProps())
    const nearestBoardWh = nearestBoardSize(displaySize, nHexes, statsVisible)
    const showSize = nearestBoardWh.scaleXY(1, 0.5).round()
    const fitHexes = (n: number, hf: boolean) => fitToDisplay(
        displaySize, n, hf, statsVisible, props.changeLocalOption
    )
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
                        nHexes,
                        boardHexCounts(displaySize, statsVisible).counts,
                        fitHexes,
                    )}
                    {MakeInputRange(
                        'Robots',
                        value => `${value}`,
                        'How many AI opponents?',
                        props.localOptions.numRobots,
                        0, MAX_PLAYERS - 1,
                        optionChanger('numRobots', true),
                    )}
                    {MakeInputRange(
                        'Difficulty',
                        value => LGO_DIFFICULTY_NAMES[value],
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
