import {describe, expect, test} from 'vitest'
import Inflector from './inflector.js'


const inflector = new Inflector()


describe('Inflector', () => {

    describe('plural', () => {

        test('regular plurals', () => {
            expect(inflector.plural('cat')).toBe('cats')
            expect(inflector.plural('dog')).toBe('dogs')
            expect(inflector.plural('book')).toBe('books')
            expect(inflector.plural('car')).toBe('cars')
        })


        test('words ending in s, x, z, ch, sh', () => {
            expect(inflector.plural('bus')).toBe('buses')
            expect(inflector.plural('box')).toBe('boxes')
            expect(inflector.plural('quiz')).toBe('quizzes')
            expect(inflector.plural('church')).toBe('churches')
            expect(inflector.plural('dish')).toBe('dishes')
        })


        test('words ending in consonant + y', () => {
            expect(inflector.plural('city')).toBe('cities')
            expect(inflector.plural('fly')).toBe('flies')
            expect(inflector.plural('story')).toBe('stories')
        })


        test('irregular plurals', () => {
            expect(inflector.plural('child')).toBe('children')
            expect(inflector.plural('person')).toBe('people')
            expect(inflector.plural('man')).toBe('men')
            expect(inflector.plural('woman')).toBe('women')
            expect(inflector.plural('foot')).toBe('feet')
            expect(inflector.plural('tooth')).toBe('teeth')
            expect(inflector.plural('goose')).toBe('geese')
            expect(inflector.plural('mouse')).toBe('mice')
        })


        test('words ending in f/fe become ves', () => {
            expect(inflector.plural('knife')).toBe('knives')
            expect(inflector.plural('wife')).toBe('wives')
            expect(inflector.plural('life')).toBe('lives')
            expect(inflector.plural('leaf')).toBe('leaves')
            expect(inflector.plural('half')).toBe('halves')
            expect(inflector.plural('wolf')).toBe('wolves')
            expect(inflector.plural('thief')).toBe('thieves')
        })


        test('words ending in o', () => {
            expect(inflector.plural('hero')).toBe('heroes')
            expect(inflector.plural('potato')).toBe('potatoes')
            expect(inflector.plural('tomato')).toBe('tomatoes')
            expect(inflector.plural('echo')).toBe('echoes')
            expect(inflector.plural('volcano')).toBe('volcanoes')
            expect(inflector.plural('tornado')).toBe('tornadoes')
        })


        test('Latin/Greek endings', () => {
            expect(inflector.plural('focus')).toBe('foci')
            expect(inflector.plural('cactus')).toBe('cacti')
            expect(inflector.plural('fungus')).toBe('fungi')
            expect(inflector.plural('nucleus')).toBe('nuclei')
            expect(inflector.plural('radius')).toBe('radii')
            expect(inflector.plural('stimulus')).toBe('stimuli')
            expect(inflector.plural('syllabus')).toBe('syllabi')
            expect(inflector.plural('alumnus')).toBe('alumni')
        })


        test('words ending in -is become -es', () => {
            expect(inflector.plural('analysis')).toBe('analyses')
            expect(inflector.plural('basis')).toBe('bases')
            expect(inflector.plural('crisis')).toBe('crises')
            expect(inflector.plural('diagnosis')).toBe('diagnoses')
            expect(inflector.plural('hypothesis')).toBe('hypotheses')
            expect(inflector.plural('thesis')).toBe('theses')
            expect(inflector.plural('axis')).toBe('axes')
        })


        test('words ending in -um become -a', () => {
            expect(inflector.plural('datum')).toBe('data')
            expect(inflector.plural('curriculum')).toBe('curricula')
            expect(inflector.plural('symposium')).toBe('symposia')
            expect(inflector.plural('bacterium')).toBe('bacteria')
            expect(inflector.plural('millennium')).toBe('millennia')
            expect(inflector.plural('addendum')).toBe('addenda')
            expect(inflector.plural('erratum')).toBe('errata')
        })


        test('words ending in -on become -a', () => {
            expect(inflector.plural('criterion')).toBe('criteria')
            expect(inflector.plural('phenomenon')).toBe('phenomena')
        })


        test('words ending in -a become -ae', () => {
            expect(inflector.plural('alumna')).toBe('alumnae')
            expect(inflector.plural('vertebra')).toBe('vertebrae')
            expect(inflector.plural('alga')).toBe('algae')
        })


        test('words ending in -ex/-ix become -ices', () => {
            expect(inflector.plural('index')).toBe('indices')
            expect(inflector.plural('appendix')).toBe('appendices')
            expect(inflector.plural('matrix')).toBe('matrices')
        })


        test('pronouns and special irregulars', () => {
            expect(inflector.plural('I')).toBe('WE')
            expect(inflector.plural('me')).toBe('us')
            expect(inflector.plural('he')).toBe('they')
            expect(inflector.plural('she')).toBe('they')
            expect(inflector.plural('this')).toBe('these')
            expect(inflector.plural('that')).toBe('those')
            expect(inflector.plural('is')).toBe('are')
            expect(inflector.plural('was')).toBe('were')
            expect(inflector.plural('has')).toBe('have')
        })

    })


    describe('singular', () => {

        test('regular singulars', () => {
            expect(inflector.singular('cats')).toBe('cat')
            expect(inflector.singular('dogs')).toBe('dog')
            expect(inflector.singular('books')).toBe('book')
            expect(inflector.singular('cars')).toBe('car')
        })


        test('words ending in es', () => {
            expect(inflector.singular('buses')).toBe('bus')
            expect(inflector.singular('boxes')).toBe('box')
            expect(inflector.singular('churches')).toBe('church')
            expect(inflector.singular('dishes')).toBe('dish')
        })


        test('words ending in ies', () => {
            expect(inflector.singular('cities')).toBe('city')
            expect(inflector.singular('flies')).toBe('fly')
            expect(inflector.singular('stories')).toBe('story')
        })


        test('irregular singulars', () => {
            expect(inflector.singular('children')).toBe('child')
            expect(inflector.singular('people')).toBe('person')
            expect(inflector.singular('men')).toBe('man')
            expect(inflector.singular('women')).toBe('woman')
            expect(inflector.singular('feet')).toBe('foot')
            expect(inflector.singular('teeth')).toBe('tooth')
            expect(inflector.singular('geese')).toBe('goose')
            expect(inflector.singular('mice')).toBe('mouse')
        })

    })


    describe('isPlural / isSingular', () => {

        test('isPlural returns true for plural words', () => {
            expect(inflector.isPlural('cats')).toBe(true)
            expect(inflector.isPlural('children')).toBe(true)
            expect(inflector.isPlural('people')).toBe(true)
        })


        test('isSingular returns true for singular words', () => {
            expect(inflector.isSingular('cat')).toBe(true)
            expect(inflector.isSingular('child')).toBe(true)
            expect(inflector.isSingular('person')).toBe(true)
        })

    })


    describe('uncountables', () => {

        test('uncountable words stay the same in plural', () => {
            expect(inflector.plural('fish')).toBe('fish')
            expect(inflector.plural('sheep')).toBe('sheep')
            expect(inflector.plural('deer')).toBe('deer')
            expect(inflector.plural('moose')).toBe('moose')
        })


        test('uncountable words stay the same in singular', () => {
            expect(inflector.singular('fish')).toBe('fish')
            expect(inflector.singular('sheep')).toBe('sheep')
            expect(inflector.singular('deer')).toBe('deer')
            expect(inflector.singular('moose')).toBe('moose')
        })

    })


    describe('pluralize with count', () => {

        test('returns singular for count 1', () => {
            expect(inflector.pluralize('cat', 1)).toBe('cat')
            expect(inflector.pluralize('child', 1)).toBe('child')
        })


        test('returns plural for count != 1', () => {
            expect(inflector.pluralize('cat', 0)).toBe('cats')
            expect(inflector.pluralize('cat', 2)).toBe('cats')
            expect(inflector.pluralize('child', 5)).toBe('children')
        })


        test('includes count when inclusive is true', () => {
            expect(inflector.pluralize('cat', 1, true)).toBe('1 cat')
            expect(inflector.pluralize('cat', 3, true)).toBe('3 cats')
            expect(inflector.pluralize('child', 1, true)).toBe('1 child')
            expect(inflector.pluralize('child', 5, true)).toBe('5 children')
        })

    })


    describe('case preservation', () => {

        test('preserves lowercase', () => {
            expect(inflector.plural('cat')).toBe('cats')
        })


        test('preserves uppercase', () => {
            expect(inflector.plural('CAT')).toBe('CATS')
        })


        test('preserves title case', () => {
            expect(inflector.plural('Cat')).toBe('Cats')
        })

    })


    describe('toCamelCase', () => {

        test('converts snake_case', () => {
            expect(inflector.toCamelCase('hello_world')).toBe('helloWorld')
        })


        test('converts kebab-case', () => {
            expect(inflector.toCamelCase('hello-world')).toBe('helloWorld')
        })


        test('converts space separated', () => {
            expect(inflector.toCamelCase('hello world')).toBe('helloWorld')
        })


        test('converts PascalCase', () => {
            expect(inflector.toCamelCase('HelloWorld')).toBe('helloWorld')
        })


        test('handles single word', () => {
            expect(inflector.toCamelCase('Hello')).toBe('hello')
        })

    })


    describe('toPascalCase', () => {

        test('converts snake_case', () => {
            expect(inflector.toPascalCase('hello_world')).toBe('HelloWorld')
        })


        test('converts kebab-case', () => {
            expect(inflector.toPascalCase('hello-world')).toBe('HelloWorld')
        })


        test('converts space separated', () => {
            expect(inflector.toPascalCase('hello world')).toBe('HelloWorld')
        })


        test('keeps PascalCase', () => {
            expect(inflector.toPascalCase('HelloWorld')).toBe('HelloWorld')
        })


        test('handles single word', () => {
            expect(inflector.toPascalCase('Hello')).toBe('Hello')
        })

    })


    describe('toSnakeCase', () => {

        test('converts camelCase', () => {
            expect(inflector.toSnakeCase('helloWorld')).toBe('hello_world')
        })


        test('converts PascalCase', () => {
            expect(inflector.toSnakeCase('HelloWorld')).toBe('hello_world')
        })


        test('converts kebab-case', () => {
            expect(inflector.toSnakeCase('hello-world')).toBe('hello_world')
        })


        test('converts space separated', () => {
            expect(inflector.toSnakeCase('hello world')).toBe('hello_world')
        })


        test('handles single word', () => {
            expect(inflector.toSnakeCase('Hello')).toBe('hello')
        })

    })


    describe('toKebabCase', () => {

        test('converts camelCase', () => {
            expect(inflector.toKebabCase('helloWorld')).toBe('hello-world')
        })


        test('converts PascalCase', () => {
            expect(inflector.toKebabCase('HelloWorld')).toBe('hello-world')
        })


        test('converts snake_case', () => {
            expect(inflector.toKebabCase('hello_world')).toBe('hello-world')
        })


        test('converts space separated', () => {
            expect(inflector.toKebabCase('hello world')).toBe('hello-world')
        })


        test('handles single word', () => {
            expect(inflector.toKebabCase('Hello')).toBe('hello')
        })

    })


    describe('toHumanCase', () => {

        test('converts PascalCase', () => {
            expect(inflector.toHumanCase('GettingStarted')).toBe('Getting Started')
        })


        test('converts camelCase', () => {
            expect(inflector.toHumanCase('helloWorld')).toBe('hello World')
        })


        test('converts snake_case', () => {
            expect(inflector.toHumanCase('hello_world')).toBe('hello world')
        })


        test('converts kebab-case', () => {
            expect(inflector.toHumanCase('hello-world')).toBe('hello world')
        })


        test('handles consecutive uppercase', () => {
            expect(inflector.toHumanCase('HTMLParser')).toBe('HTML Parser')
        })


        test('handles single word', () => {
            expect(inflector.toHumanCase('Hello')).toBe('Hello')
        })

    })


    test('addPluralRule adds a custom plural rule', () => {
        const customInflector = new Inflector()
        customInflector.addPluralRule(/zyx$/i, 'zyxes')

        expect(customInflector.plural('zyx')).toBe('zyxes')
    })


    test('addSingularRule adds a custom singular rule', () => {
        const customInflector = new Inflector()
        customInflector.addSingularRule(/zyxes$/i, 'zyx')

        expect(customInflector.singular('zyxes')).toBe('zyx')
    })


    test('addUncountableRule adds an uncountable word', () => {
        const customInflector = new Inflector()
        customInflector.addUncountableRule('customword')

        expect(customInflector.plural('customword')).toBe('customword')
        expect(customInflector.singular('customword')).toBe('customword')
    })


    test('addIrregularRule adds an irregular plural/singular pair', () => {
        const customInflector = new Inflector()
        customInflector.addIrregularRule('customsingle', 'customplural')

        expect(customInflector.plural('customsingle')).toBe('customplural')
        expect(customInflector.singular('customplural')).toBe('customsingle')
    })

})
