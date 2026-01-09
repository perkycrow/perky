import {doc, text, see} from '../doc/runtime.js'


export default doc('Game', () => {

    text(`
        Game extends [[Application@application]] with a game loop and render system built-in.
        It's the standard starting point for most games.

        *Work in progress.*
    `)

    see('Application', {category: 'application'})
    see('GameLoop', {category: 'game'})

})
