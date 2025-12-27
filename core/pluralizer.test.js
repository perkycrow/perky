import {describe, expect, test} from 'vitest'
import Pluralizer from './pluralizer'


const pluralizer = new Pluralizer()


describe('Pluralizer', () => {

    describe('plural', () => {

        test('regular plurals', () => {
            expect(pluralizer.plural('cat')).toBe('cats')
            expect(pluralizer.plural('dog')).toBe('dogs')
            expect(pluralizer.plural('book')).toBe('books')
            expect(pluralizer.plural('car')).toBe('cars')
        })


        test('words ending in s, x, z, ch, sh', () => {
            expect(pluralizer.plural('bus')).toBe('buses')
            expect(pluralizer.plural('box')).toBe('boxes')
            expect(pluralizer.plural('quiz')).toBe('quizzes')
            expect(pluralizer.plural('church')).toBe('churches')
            expect(pluralizer.plural('dish')).toBe('dishes')
        })


        test('words ending in consonant + y', () => {
            expect(pluralizer.plural('city')).toBe('cities')
            expect(pluralizer.plural('fly')).toBe('flies')
            expect(pluralizer.plural('story')).toBe('stories')
        })


        test('irregular plurals', () => {
            expect(pluralizer.plural('child')).toBe('children')
            expect(pluralizer.plural('person')).toBe('people')
            expect(pluralizer.plural('man')).toBe('men')
            expect(pluralizer.plural('woman')).toBe('women')
            expect(pluralizer.plural('foot')).toBe('feet')
            expect(pluralizer.plural('tooth')).toBe('teeth')
            expect(pluralizer.plural('goose')).toBe('geese')
            expect(pluralizer.plural('mouse')).toBe('mice')
        })

    })


    describe('singular', () => {

        test('regular singulars', () => {
            expect(pluralizer.singular('cats')).toBe('cat')
            expect(pluralizer.singular('dogs')).toBe('dog')
            expect(pluralizer.singular('books')).toBe('book')
            expect(pluralizer.singular('cars')).toBe('car')
        })


        test('words ending in es', () => {
            expect(pluralizer.singular('buses')).toBe('bus')
            expect(pluralizer.singular('boxes')).toBe('box')
            expect(pluralizer.singular('churches')).toBe('church')
            expect(pluralizer.singular('dishes')).toBe('dish')
        })


        test('words ending in ies', () => {
            expect(pluralizer.singular('cities')).toBe('city')
            expect(pluralizer.singular('flies')).toBe('fly')
            expect(pluralizer.singular('stories')).toBe('story')
        })


        test('irregular singulars', () => {
            expect(pluralizer.singular('children')).toBe('child')
            expect(pluralizer.singular('people')).toBe('person')
            expect(pluralizer.singular('men')).toBe('man')
            expect(pluralizer.singular('women')).toBe('woman')
            expect(pluralizer.singular('feet')).toBe('foot')
            expect(pluralizer.singular('teeth')).toBe('tooth')
            expect(pluralizer.singular('geese')).toBe('goose')
            expect(pluralizer.singular('mice')).toBe('mouse')
        })

    })


    describe('isPlural / isSingular', () => {

        test('isPlural returns true for plural words', () => {
            expect(pluralizer.isPlural('cats')).toBe(true)
            expect(pluralizer.isPlural('children')).toBe(true)
            expect(pluralizer.isPlural('people')).toBe(true)
        })


        test('isSingular returns true for singular words', () => {
            expect(pluralizer.isSingular('cat')).toBe(true)
            expect(pluralizer.isSingular('child')).toBe(true)
            expect(pluralizer.isSingular('person')).toBe(true)
        })

    })


    describe('uncountables', () => {

        test('uncountable words stay the same', () => {
            expect(pluralizer.plural('fish')).toBe('fish')
            expect(pluralizer.singular('fish')).toBe('fish')

            expect(pluralizer.plural('sheep')).toBe('sheep')
            expect(pluralizer.singular('sheep')).toBe('sheep')

            expect(pluralizer.plural('deer')).toBe('deer')
            expect(pluralizer.singular('deer')).toBe('deer')

            expect(pluralizer.plural('moose')).toBe('moose')
            expect(pluralizer.singular('moose')).toBe('moose')
        })

    })


    describe('pluralize with count', () => {

        test('returns singular for count 1', () => {
            expect(pluralizer.pluralize('cat', 1)).toBe('cat')
            expect(pluralizer.pluralize('child', 1)).toBe('child')
        })


        test('returns plural for count != 1', () => {
            expect(pluralizer.pluralize('cat', 0)).toBe('cats')
            expect(pluralizer.pluralize('cat', 2)).toBe('cats')
            expect(pluralizer.pluralize('child', 5)).toBe('children')
        })


        test('includes count when inclusive is true', () => {
            expect(pluralizer.pluralize('cat', 1, true)).toBe('1 cat')
            expect(pluralizer.pluralize('cat', 3, true)).toBe('3 cats')
            expect(pluralizer.pluralize('child', 1, true)).toBe('1 child')
            expect(pluralizer.pluralize('child', 5, true)).toBe('5 children')
        })

    })


    describe('case preservation', () => {

        test('preserves lowercase', () => {
            expect(pluralizer.plural('cat')).toBe('cats')
        })


        test('preserves uppercase', () => {
            expect(pluralizer.plural('CAT')).toBe('CATS')
        })


        test('preserves title case', () => {
            expect(pluralizer.plural('Cat')).toBe('Cats')
        })

    })

})
