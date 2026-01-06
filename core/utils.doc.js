import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import {
    toCamelCase,
    toPascalCase,
    toSnakeCase,
    toKebabCase,
    uniqueId,
    resetUniqueId,
    singularize,
    pluralize,
    plural,
    isPlural,
    isSingular,
    setDefaults,
    getNestedValue,
    setNestedValue,
    deepMerge,
    exportValue,
    formatNumber,
    formatBytes,
    delegateProperties
} from './utils.js'


export default doc('Utils', {context: 'simple'}, () => {

    text(`
        Collection of utility functions for string manipulation,
        object operations, and data formatting.
    `)


    section('String Case Conversion', () => {

        text('Convert strings between different naming conventions.')

        action('toCamelCase', () => {
            logger.log('snake_case:', toCamelCase('snake_case'))
            logger.log('kebab-case:', toCamelCase('kebab-case'))
            logger.log('PascalCase:', toCamelCase('PascalCase'))
        })

        action('toPascalCase', () => {
            logger.log('snake_case:', toPascalCase('snake_case'))
            logger.log('camelCase:', toPascalCase('camelCase'))
            logger.log('kebab-case:', toPascalCase('kebab-case'))
        })

        action('toSnakeCase', () => {
            logger.log('camelCase:', toSnakeCase('camelCase'))
            logger.log('PascalCase:', toSnakeCase('PascalCase'))
            logger.log('kebab-case:', toSnakeCase('kebab-case'))
        })

        action('toKebabCase', () => {
            logger.log('camelCase:', toKebabCase('camelCase'))
            logger.log('PascalCase:', toKebabCase('PascalCase'))
            logger.log('snake_case:', toKebabCase('snake_case'))
        })

    })


    section('Unique IDs', () => {

        text('Generate unique identifiers with optional prefixes and collections.')

        action('uniqueId', () => {
            resetUniqueId('demo')
            logger.log('first:', uniqueId('demo', 'player'))
            logger.log('second:', uniqueId('demo', 'player'))
            logger.log('third:', uniqueId('demo', 'player'))
            logger.log('different prefix:', uniqueId('demo', 'enemy'))
        })

        action('resetUniqueId', () => {
            resetUniqueId('demo')
            logger.log('after reset:', uniqueId('demo', 'player'))
            logger.log('next:', uniqueId('demo', 'player'))
            resetUniqueId('demo', 'player')
            logger.log('after prefix reset:', uniqueId('demo', 'player'))
        })

    })


    section('Pluralization', () => {

        text('Singular and plural word transformations.')

        action('singularize / plural', () => {
            logger.log('players:', singularize('players'))
            logger.log('enemies:', singularize('enemies'))
            logger.log('children:', singularize('children'))
            logger.log('player:', plural('player'))
            logger.log('enemy:', plural('enemy'))
            logger.log('child:', plural('child'))
        })

        action('pluralize (with count)', () => {
            logger.log('0:', pluralize('item', 0, true))
            logger.log('1:', pluralize('item', 1, true))
            logger.log('5:', pluralize('item', 5, true))
        })

        action('isPlural / isSingular', () => {
            logger.log('players is plural:', isPlural('players'))
            logger.log('player is plural:', isPlural('player'))
            logger.log('player is singular:', isSingular('player'))
            logger.log('players is singular:', isSingular('players'))
        })

    })


    section('Nested Objects', () => {

        text('Access and modify deeply nested object properties using dot notation.')

        action('getNestedValue', () => {
            const obj = {
                player: {
                    stats: {health: 100, mana: 50},
                    position: {x: 10, y: 20}
                }
            }
            logger.log('player.stats.health:', getNestedValue(obj, 'player.stats.health'))
            logger.log('player.position:', getNestedValue(obj, 'player.position'))
            logger.log('missing path:', getNestedValue(obj, 'player.inventory.items'))
        })

        action('setNestedValue', () => {
            const obj = {player: {stats: {}}}
            setNestedValue(obj, 'player.stats.health', 100)
            setNestedValue(obj, 'player.position.x', 50)
            logger.log('result:', JSON.stringify(obj))
        })

    })


    section('Object Merging', () => {

        text('Deep merge objects and apply defaults.')

        action('deepMerge', () => {
            const target = {a: 1, nested: {x: 10}}
            const source = {b: 2, nested: {y: 20}}
            const result = deepMerge(target, source)
            logger.log('merged:', JSON.stringify(result))
        })

        action('setDefaults', () => {
            const data = {name: 'Player', score: 100}
            const defaults = {name: 'Unknown', health: 100, score: 0}
            const result = setDefaults(data, defaults)
            logger.log('with defaults:', JSON.stringify(result))
        })

        code('Array merging', () => {
            const target = {items: ['sword']}
            const source = {items: ['shield']}
            const result = deepMerge(target, source)

            // Arrays are concatenated: ['sword', 'shield']
        })

    })


    section('Export', () => {

        text('Recursively export object values, calling `.export()` on objects that have it.')

        action('exportValue', () => {
            const data = {
                name: 'test',
                nested: {value: 42},
                items: [1, 2, 3]
            }
            logger.log('exported:', JSON.stringify(exportValue(data)))
        })

        code('With export method', () => {
            const obj = {
                data: 'internal',
                export () {
                    return {result: this.data}
                }
            }

            // exportValue(obj) returns {result: 'internal'}
        })

    })


    section('Formatting', () => {

        text('Format numbers and byte sizes for display.')

        action('formatNumber', () => {
            logger.log('integer:', formatNumber(42))
            logger.log('float:', formatNumber(3.14159))
            logger.log('string:', formatNumber('test'))
        })

        action('formatBytes', () => {
            logger.log('0:', formatBytes(0))
            logger.log('500:', formatBytes(500))
            logger.log('1024:', formatBytes(1024))
            logger.log('1536:', formatBytes(1536))
            logger.log('1048576:', formatBytes(1048576))
            logger.log('1073741824:', formatBytes(1073741824))
        })

    })


    section('Delegation', () => {

        text('Delegate properties from one object to another.')

        action('delegateProperties (array)', () => {
            const source = {
                name: 'Source',
                getValue () {
                    return 42
                }
            }
            const receiver = {}
            delegateProperties(receiver, source, ['name', 'getValue'])
            logger.log('name:', receiver.name)
            logger.log('getValue():', receiver.getValue())
        })

        action('delegateProperties (rename)', () => {
            const source = {x: 10, y: 20}
            const receiver = {}
            delegateProperties(receiver, source, {x: 'posX', y: 'posY'})
            logger.log('posX:', receiver.posX)
            logger.log('posY:', receiver.posY)
        })

    })

})
