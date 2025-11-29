import Application from '../application/application'
import GameExtension from '../game/game_extension'
import Canvas2D from '../canvas/canvas_2d'
import manifest from './manifest'


export default class DefendTheDen extends Application {

    constructor (params = {}) {
        super({manifest, ...params})
    }

    configure () {
        this.use(GameExtension, {$bind: 'game'})

        console.log(this)
    }

}
