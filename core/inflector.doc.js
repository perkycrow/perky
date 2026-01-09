import {doc, section, setup, text, code, action, logger} from '../doc/runtime.js'
import Inflector from './inflector.js'


export default doc('Inflector', {context: 'simple'}, () => {

    text(`
        English language inflection and string transformation utilities.
        Handles pluralization, singularization, and case conversion.

        For convenience, [[Utils]] exposes standalone functions using a shared instance.
        Use Inflector directly when you need custom rules.
    `)


    section('Pluralization', () => {

        setup(ctx => {
            ctx.inflector = new Inflector()
        })

        text('Convert singular words to plural form.')

        action('Regular plurals', ctx => {
            logger.log('cat:', ctx.inflector.plural('cat'))
            logger.log('dog:', ctx.inflector.plural('dog'))
            logger.log('house:', ctx.inflector.plural('house'))
            logger.log('box:', ctx.inflector.plural('box'))
            logger.log('bus:', ctx.inflector.plural('bus'))
        })

        action('Irregular plurals', ctx => {
            logger.log('child:', ctx.inflector.plural('child'))
            logger.log('person:', ctx.inflector.plural('person'))
            logger.log('goose:', ctx.inflector.plural('goose'))
            logger.log('tooth:', ctx.inflector.plural('tooth'))
            logger.log('ox:', ctx.inflector.plural('ox'))
        })

        action('Words ending in y', ctx => {
            logger.log('city:', ctx.inflector.plural('city'))
            logger.log('party:', ctx.inflector.plural('party'))
            logger.log('baby:', ctx.inflector.plural('baby'))
            logger.log('key:', ctx.inflector.plural('key'))
        })

        action('Uncountable words', ctx => {
            logger.log('sheep:', ctx.inflector.plural('sheep'))
            logger.log('fish:', ctx.inflector.plural('fish'))
            logger.log('moose:', ctx.inflector.plural('moose'))
            logger.log('information:', ctx.inflector.plural('information'))
        })

    })


    section('Singularization', () => {

        setup(ctx => {
            ctx.inflector = new Inflector()
        })

        text('Convert plural words to singular form.')

        action('Regular singulars', ctx => {
            logger.log('cats:', ctx.inflector.singular('cats'))
            logger.log('dogs:', ctx.inflector.singular('dogs'))
            logger.log('houses:', ctx.inflector.singular('houses'))
            logger.log('boxes:', ctx.inflector.singular('boxes'))
        })

        action('Irregular singulars', ctx => {
            logger.log('children:', ctx.inflector.singular('children'))
            logger.log('people:', ctx.inflector.singular('people'))
            logger.log('geese:', ctx.inflector.singular('geese'))
            logger.log('teeth:', ctx.inflector.singular('teeth'))
        })

        action('Words ending in ies', ctx => {
            logger.log('cities:', ctx.inflector.singular('cities'))
            logger.log('parties:', ctx.inflector.singular('parties'))
            logger.log('babies:', ctx.inflector.singular('babies'))
        })

        action('Uncountable words', ctx => {
            logger.log('sheep:', ctx.inflector.singular('sheep'))
            logger.log('fish:', ctx.inflector.singular('fish'))
            logger.log('deer:', ctx.inflector.singular('deer'))
        })

    })


    section('Pluralize with Count', () => {

        setup(ctx => {
            ctx.inflector = new Inflector()
        })

        text('Pluralize based on count, optionally including the number.')

        action('Without count prefix', ctx => {
            logger.log('0 items:', ctx.inflector.pluralize('item', 0))
            logger.log('1 item:', ctx.inflector.pluralize('item', 1))
            logger.log('5 items:', ctx.inflector.pluralize('item', 5))
        })

        action('With count prefix', ctx => {
            logger.log('0:', ctx.inflector.pluralize('item', 0, true))
            logger.log('1:', ctx.inflector.pluralize('item', 1, true))
            logger.log('5:', ctx.inflector.pluralize('item', 5, true))
        })

        action('Irregular words', ctx => {
            logger.log('1 child:', ctx.inflector.pluralize('child', 1, true))
            logger.log('3 children:', ctx.inflector.pluralize('child', 3, true))
            logger.log('1 person:', ctx.inflector.pluralize('person', 1, true))
            logger.log('10 people:', ctx.inflector.pluralize('person', 10, true))
        })

    })


    section('Checking Form', () => {

        setup(ctx => {
            ctx.inflector = new Inflector()
        })

        text('Check if a word is plural or singular.')

        action('isPlural', ctx => {
            logger.log('cats is plural:', ctx.inflector.isPlural('cats'))
            logger.log('cat is plural:', ctx.inflector.isPlural('cat'))
            logger.log('children is plural:', ctx.inflector.isPlural('children'))
            logger.log('sheep is plural:', ctx.inflector.isPlural('sheep'))
        })

        action('isSingular', ctx => {
            logger.log('cat is singular:', ctx.inflector.isSingular('cat'))
            logger.log('cats is singular:', ctx.inflector.isSingular('cats'))
            logger.log('child is singular:', ctx.inflector.isSingular('child'))
            logger.log('fish is singular:', ctx.inflector.isSingular('fish'))
        })

    })


    section('Case Conversion', () => {

        setup(ctx => {
            ctx.inflector = new Inflector()
        })

        text('Convert between different naming conventions.')

        action('toCamelCase', ctx => {
            logger.log('snake_case:', ctx.inflector.toCamelCase('snake_case'))
            logger.log('kebab-case:', ctx.inflector.toCamelCase('kebab-case'))
            logger.log('PascalCase:', ctx.inflector.toCamelCase('PascalCase'))
            logger.log('with spaces:', ctx.inflector.toCamelCase('hello world'))
        })

        action('toPascalCase', ctx => {
            logger.log('camelCase:', ctx.inflector.toPascalCase('camelCase'))
            logger.log('snake_case:', ctx.inflector.toPascalCase('snake_case'))
            logger.log('kebab-case:', ctx.inflector.toPascalCase('kebab-case'))
        })

        action('toSnakeCase', ctx => {
            logger.log('camelCase:', ctx.inflector.toSnakeCase('camelCase'))
            logger.log('PascalCase:', ctx.inflector.toSnakeCase('PascalCase'))
            logger.log('kebab-case:', ctx.inflector.toSnakeCase('kebab-case'))
            logger.log('with spaces:', ctx.inflector.toSnakeCase('hello world'))
        })

        action('toKebabCase', ctx => {
            logger.log('camelCase:', ctx.inflector.toKebabCase('camelCase'))
            logger.log('PascalCase:', ctx.inflector.toKebabCase('PascalCase'))
            logger.log('snake_case:', ctx.inflector.toKebabCase('snake_case'))
        })

        action('toHumanCase', ctx => {
            logger.log('camelCase:', ctx.inflector.toHumanCase('camelCase'))
            logger.log('PascalCase:', ctx.inflector.toHumanCase('PascalCase'))
            logger.log('snake_case:', ctx.inflector.toHumanCase('snake_case'))
            logger.log('kebab-case:', ctx.inflector.toHumanCase('kebab-case'))
        })

    })


    section('Case Preservation', () => {

        setup(ctx => {
            ctx.inflector = new Inflector()
        })

        text('Inflections preserve the original case.')

        action('Uppercase', ctx => {
            logger.log('CAT:', ctx.inflector.plural('CAT'))
            logger.log('DOG:', ctx.inflector.plural('DOG'))
            logger.log('CHILD:', ctx.inflector.plural('CHILD'))
        })

        action('Title case', ctx => {
            logger.log('Cat:', ctx.inflector.plural('Cat'))
            logger.log('Person:', ctx.inflector.plural('Person'))
            logger.log('Children:', ctx.inflector.singular('Children'))
        })

        action('Mixed case', ctx => {
            logger.log('CaT:', ctx.inflector.plural('CaT'))
            logger.log('DoG:', ctx.inflector.plural('DoG'))
        })

    })


    section('Custom Rules', () => {

        text('Extend the inflector with custom rules.')

        action('addPluralRule', () => {
            const inflector = new Inflector()

            inflector.addPluralRule(/ninja$/i, 'ninjas')
            logger.log('ninja:', inflector.plural('ninja'))

            inflector.addPluralRule(/pokemon$/i, 'pokemon')
            logger.log('pokemon:', inflector.plural('pokemon'))
        })

        action('addSingularRule', () => {
            const inflector = new Inflector()

            inflector.addSingularRule(/ninjas$/i, 'ninja')
            logger.log('ninjas:', inflector.singular('ninjas'))
        })

        action('addUncountableRule', () => {
            const inflector = new Inflector()

            inflector.addUncountableRule('mana')
            logger.log('singular:', inflector.singular('mana'))
            logger.log('plural:', inflector.plural('mana'))
            logger.log('is plural:', inflector.isPlural('mana'))
            logger.log('is singular:', inflector.isSingular('mana'))
        })

        action('addIrregularRule', () => {
            const inflector = new Inflector()

            inflector.addIrregularRule('cactus', 'cacti')
            logger.log('cactus:', inflector.plural('cactus'))
            logger.log('cacti:', inflector.singular('cacti'))
            logger.log('is plural cacti:', inflector.isPlural('cacti'))
        })

    })


    section('Practical Examples', () => {

        setup(ctx => {
            ctx.inflector = new Inflector()
        })

        text('Real-world usage patterns.')

        action('Dynamic labels', ctx => {
            const counts = [0, 1, 5]
            counts.forEach(count => {
                const label = ctx.inflector.pluralize('enemy', count, true)
                logger.log(label)
            })
        })

        action('API endpoints', ctx => {
            const singular = 'player'
            const endpoint = ctx.inflector.plural(singular)
            logger.log(`GET /api/${endpoint}`)
            logger.log(`POST /api/${endpoint}/:id`)
        })

        action('Variable naming', ctx => {
            const model = 'UserProfile'
            const snake = ctx.inflector.toSnakeCase(model)
            const camel = ctx.inflector.toCamelCase(snake)
            const plural = ctx.inflector.plural(camel)

            logger.log('Model:', model)
            logger.log('Table:', snake)
            logger.log('Variable:', camel)
            logger.log('Collection:', plural)
        })

        action('Database conventions', ctx => {
            const className = 'GameSession'
            const tableName = ctx.inflector.plural(
                ctx.inflector.toSnakeCase(className)
            )

            logger.log('Class:', className)
            logger.log('Table:', tableName)
        })

    })


    section('Advanced Patterns', () => {

        text('Complex transformations and edge cases.')

        action('Compound words', () => {
            const inflector = new Inflector()

            logger.log('passerby:', inflector.plural('passerby'))
            logger.log('mother-in-law:', inflector.plural('mother-in-law'))
        })

        action('Latin/Greek origins', () => {
            const inflector = new Inflector()

            logger.log('cactus:', inflector.plural('cactus'))
            logger.log('fungus:', inflector.plural('fungus'))
            logger.log('radius:', inflector.plural('radius'))
            logger.log('alumnus:', inflector.plural('alumnus'))
            logger.log('stimulus:', inflector.plural('stimulus'))
        })

        action('Words ending in f/fe', () => {
            const inflector = new Inflector()

            logger.log('knife:', inflector.plural('knife'))
            logger.log('life:', inflector.plural('life'))
            logger.log('wolf:', inflector.plural('wolf'))
            logger.log('shelf:', inflector.plural('shelf'))
        })

        code('Batch processing', () => {
            const inflector = new Inflector()

            const words = ['player', 'enemy', 'item', 'quest']
            const plurals = words.map(w => inflector.plural(w))
            const snakePlurals = plurals.map(w => inflector.toSnakeCase(w))

            // ['players', 'enemies', 'items', 'quests']
            // ['players', 'enemies', 'items', 'quests']
        })

    })


    section('Built-in Rules', () => {

        text('The inflector comes with comprehensive built-in rules.')

        code('Irregular plurals', () => {
            // Common irregulars built-in:
            // child → children
            // person → people
            // man → men
            // woman → women
            // tooth → teeth
            // foot → feet
            // goose → geese
            // mouse → mice
            // ox → oxen
            // And many more...
        })

        code('Uncountable words', () => {
            // Words that are the same in both forms:
            // sheep, fish, deer, moose
            // information, equipment, furniture
            // rice, money, music, audio
            // And many more...
        })

        code('Pattern rules', () => {
            // Automatic rules for common patterns:
            // -s, -es, -ies endings
            // -f/-fe → -ves
            // -us → -i (Latin)
            // -is → -es (Greek)
            // -on → -a (Greek)
            // And many more...
        })

    })


})
