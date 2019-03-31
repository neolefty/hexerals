import * as React from 'react'

import {BoardViewProps} from './BoardViewBase'
import {PlayerFog} from '../../model/board/Fog';
import {Map} from 'immutable';
import {Player} from '../../model/players/Players';
import {HexBoardView} from './HexBoardView';

interface FogBoardProps extends BoardViewProps {}

interface FogBoardState {
    fogsCache: Map<Player, PlayerFog>  // mutable
}

export class FogBoardView extends React.PureComponent<FogBoardProps, FogBoardState> {
    componentWillMount(): void {
        this.setState({
            fogsCache: Map<Player, PlayerFog>().asMutable()
        })
    }

    getFog(): PlayerFog {
        // with Nobody, whole map will be fogged
        const curPlayer: Player = this.props.boardState.curPlayer || Player.Nobody
        if (!this.state.fogsCache.has(curPlayer))
            this.state.fogsCache.set(
                curPlayer,
                new PlayerFog(curPlayer, true)
            )
        return this.state.fogsCache.get(curPlayer) as PlayerFog
    }

    render(): React.ReactNode {
        return (
            <HexBoardView
                {...this.props}
                boardState={this.getFog().fog(this.props.boardState)}
            />
        )
    }
}