import {BoardReducerTester} from '../view/BoardReducerTester';
import {PlayerFog} from './Fog';
import {Player} from './players/Players';
import {Hex} from './Hex';
import {Terrain, Tile} from './Tile';

it('fogs the board for a player', () => {
    const brt = new BoardReducerTester(5, 5)
    const fog = new PlayerFog(Player.Zero)
    const fogged = fog.fog(brt.state).board
    expect(fogged.getTile(Hex.ORIGIN).known).toBeTruthy()
    Hex.ORIGIN.neighbors.filter(hex =>
        brt.board.inBounds(hex)).forEach(hex =>
            expect(fogged.getTile(hex).known).toBeTruthy())
    const upUpUp = Hex.ORIGIN.plus(Hex.UP.times(2))
    expect(fogged.getTile(upUpUp).known).toBeFalsy()
    // where Player.One starts — fogged city
    expect(fogged.getTile(brt.ur)).toEqual(Tile.MAYBE_MOUNTAIN)
    expect(brt.getTile(brt.ur).terrain).toEqual(Terrain.City)
})

// TODO test queueing moves in fog goes through mountains