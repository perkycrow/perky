import {doc, section, text, code, container} from '../doc/runtime.js'
import Game from '../game/game.js'
import '../editor/perky_explorer.js'


export default doc('PerkyExplorer', () => {

    text(`
        Visual inspector for exploring Perky module trees.
        Displays the hierarchy of modules, their properties, and allows navigation.
    `)


    section('Basic Usage', () => {

        text(`
            Create a PerkyExplorer and attach it to a module using \`setModule()\`.
            Use the \`embedded\` attribute for integration in containers.
        `)

        code('Standalone', () => {
            const explorer = document.createElement('perky-explorer')
            document.body.appendChild(explorer)

            // const game = new Game()
            // explorer.setModule(game)
        })

        container({title: 'Embedded explorer', height: 400, scrollable: true}, ctx => {
            const explorer = document.createElement('perky-explorer')
            explorer.embedded = true
            ctx.container.appendChild(explorer)

            const game = new Game({$id: 'myGame'})
            explorer.setModule(game)

            setTimeout(() => game.start(), 1000)

            ctx.setApp(game)
        })

    })


    section('Embedded Mode', () => {

        text(`
            The \`embedded\` attribute removes the header and minimize button,
            making the explorer suitable for integration in panels or containers.
        `)

        code('Enable embedded mode', () => {
            const explorer = document.createElement('perky-explorer')
            explorer.embedded = true

            // Or via attribute
            // <perky-explorer embedded></perky-explorer>
        })

    })


    section('Navigation', () => {

        text(`
            Click on nodes to select them and view their details.
            Use \`focusModule()\` to zoom into a specific module.
        `)

        code('Focus on a module', () => {
            const explorer = document.createElement('perky-explorer')
            // const app = new Application()
            // explorer.setModule(app)

            // Focus on a child module
            // explorer.focusModule(app.inputSystem)
        })

    })

})
