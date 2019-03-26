import {CartPair} from '../../../common/CartPair'
import {LocalGameOptions, LocalGameOptionsView} from './LocalGameOptions'
import {CycleMode} from '../model/CycleState'
import {LocalGameContainer} from './LocalGameContainer'
import * as React from 'react'
import {CycleState} from '../model/CycleState'
import {Layered} from '../../../common/Layered'
import {LocalGamePreview} from './LocalGamePreview'
import {AnalyticsAction, AnalyticsCategory, logAnalyticsEvent} from '../../../common/Analytics';

export interface CycleViewProps extends CycleState {
    displaySize: CartPair

    onOpenLocalGame: () => void
    onCloseGame: () => void
    onChangeLocalOption: (
        name: keyof LocalGameOptions, n: number
    ) => void
}

interface CycleViewState {
    highFidelity: boolean
}

export class CycleView
    extends React.Component<CycleViewProps, CycleViewState>
{
    constructor(props: CycleViewProps) {
        super(props)
        this.getHighFidelity = this.getHighFidelity.bind(this)
        this.setHighFidelity = this.setHighFidelity.bind(this)
        this.changeLocalOption = this.changeLocalOption.bind(this)
    }

    getHighFidelity(): boolean {
        return this.state
            ? this.state.highFidelity
            : true // default true
    }

    setHighFidelity(highFidelity: boolean) {
        if (this.getHighFidelity() != highFidelity)
            this.setState({
                highFidelity: highFidelity
            })
    }

    changeLocalOption(
        name: keyof LocalGameOptions, n: number, highFidelity: boolean
    ) {
        this.setHighFidelity(highFidelity)
        this.props.onChangeLocalOption(name, n)
    }

    render(): React.ReactNode {
        switch (this.props.mode) {
            case CycleMode.IN_LOCAL_GAME:
                if (this.props.localGame)
                    return (
                        <LocalGameContainer
                            displaySize={this.props.displaySize}
                            onEndGame={this.props.onCloseGame}
                            onRestartGame={() => {
                                logAnalyticsEvent(AnalyticsAction.again, AnalyticsCategory.local)
                                this.props.onOpenLocalGame
                            }}
                            localOptions={this.props.localOptions}
                        />
                    )
                else
                    return (
                        <code>Error: localGame.board is undefined</code>
                    )
            case CycleMode.NOT_IN_GAME:
                return (
                    <Layered>
                        <LocalGamePreview
                            localOptions={this.props.localOptions}
                            displaySize={this.props.displaySize}
                            highFidelity={this.getHighFidelity()}
                        />
                        <LocalGameOptionsView
                            localOptions={this.props.localOptions}
                            displaySize={this.props.displaySize}
                            newGame={this.props.onOpenLocalGame}
                            changeLocalOption={this.changeLocalOption}
                        />
                    </Layered>
                )
            default:
                return <p>Unknown mode: <code>{this.props.mode}</code></p>
        }
    }
}