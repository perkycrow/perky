import {describe, expect, test} from 'vitest'
import Inflector from './inflector'


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

        test('uncountable words stay the same', () => {
            expect(inflector.plural('fish')).toBe('fish')
            expect(inflector.singular('fish')).toBe('fish')

            expect(inflector.plural('sheep')).toBe('sheep')
            expect(inflector.singular('sheep')).toBe('sheep')

            expect(inflector.plural('deer')).toBe('deer')
            expect(inflector.singular('deer')).toBe('deer')

            expect(inflector.plural('moose')).toBe('moose')
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

})
