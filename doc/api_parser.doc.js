import {doc, section, text, code} from './runtime.js'


export default doc('Api Parser', {advanced: true}, () => {

    text(`
        Parses JavaScript source files using Acorn to extract structured API metadata.
        Produces class, method, getter, setter, and function information for the API tab.
    `)


    section('parseSourceFile', () => {

        text(`
            Parses a source string into an AST and extracts all exported classes, functions, and variables.
            Returns an object with arrays of classes, functions, and exports.
        `)

        code('Basic usage', () => {
            const result = parseSourceFile(`
                export default class Player {
                    constructor(name) {}
                    get health() {}
                    move(x, y) {}
                }
            `)

            result.classes[0].name       // "Player"
            result.classes[0].methods    // [{name: "move", params: ["x", "y"], ...}]
            result.classes[0].getters    // [{name: "health", ...}]
            result.classes[0].constructor // {params: ["name"], ...}
        })

        code('Functions and variables', () => {
            const result = parseSourceFile(`
                export function createEnemy(type) {}
                export const MAX_HEALTH = 100
            `)

            result.functions[0].name   // "createEnemy"
            result.functions[0].params // ["type"]
            result.exports[0].name     // "MAX_HEALTH"
        })

    })


    section('getApiForFile', () => {

        text(`
            Higher-level wrapper around parseSourceFile.
            Returns a simplified result typed as either "class" or "module" depending on the source content.
        `)

        code('Single class file', () => {
            const api = getApiForFile(source, '/core/player.js')

            api.type // "class"
            api.name // "Player"
        })

        code('Multi-export file', () => {
            const api = getApiForFile(source, '/core/utils.js')

            api.type      // "module"
            api.functions // [...]
            api.exports   // [...]
        })

    })


    section('Class Parsing', () => {

        text(`
            Classes are parsed into structured metadata including inheritance,
            constructors, methods, getters, setters, and static members.
            Private members (# prefix) are excluded.
        `)

        code('Result structure', () => {
            const classInfo = {
                name: 'Player',
                extends: 'Entity',
                constructor: {params: ['name', 'options = ...']},
                methods: [{name: 'move', params: ['x', 'y']}],
                getters: [{name: 'health'}],
                setters: [{name: 'health'}],
                statics: [{name: 'create', params: ['config']}]
            }
        })

    })

})
