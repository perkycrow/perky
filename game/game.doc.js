import {doc, text, see} from '../doc/runtime.js'


export default doc('Game', {context: 'game'}, () => {

    text(`
        Game extends [[Application]] with a game loop and render system built-in.
        It's the standard starting point for most games.

        *Work in progress.*
    `)

    see('Application')
    see('GameLoop')
    see('RenderSystem')

})
