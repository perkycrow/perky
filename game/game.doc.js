import {doc, text, see} from '../doc/runtime.js'


export default doc('Game', {featured: true}, () => {

    text(`
        Game extends [[Application@application]] with a game loop, render system,
        textures, and audio built-in. Use [[Stage@game]] to organize your game
        into distinct phases — levels, menus, cutscenes — each with its own
        world and world view.

        It's the standard starting point for most games.
    `)

    see('Application', {category: 'application'})
    see('GameLoop', {category: 'game'})
    see('Stage', {category: 'game'})

})
