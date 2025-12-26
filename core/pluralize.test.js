import {describe, expect, test} from 'vitest'
import pluralize from './pluralize'


describe('pluralize', () => {

    describe('pluralize.plural', () => {

        test('regular plurals', () => {
            expect(pluralize.plural('cat')).toBe('cats')
            expect(pluralize.plural('dog')).toBe('dogs')
            expect(pluralize.plural('book')).toBe('books')
            expect(pluralize.plural('car')).toBe('cars')
        })


        test('words ending in s, x, z, ch, sh', () => {
            expect(pluralize.plural('bus')).toBe('buses')
            expect(pluralize.plural('box')).toBe('boxes')
            expect(pluralize.plural('quiz')).toBe('quizzes')
            expect(pluralize.plural('church')).toBe('churches')
            expect(pluralize.plural('dish')).toBe('dishes')
        })


        test('words ending in consonant + y', () => {
            expect(pluralize.plural('city')).toBe('cities')
            expect(pluralize.plural('fly')).toBe('flies')
            expect(pluralize.plural('story')).toBe('stories')
        })


        test('irregular plurals', () => {
            expect(pluralize.plural('child')).toBe('children')
            expect(pluralize.plural('person')).toBe('people')
            expect(pluralize.plural('man')).toBe('men')
            expect(pluralize.plural('woman')).toBe('women')
            expect(pluralize.plural('foot')).toBe('feet')
            expect(pluralize.plural('tooth')).toBe('teeth')
            expect(pluralize.plural('goose')).toBe('geese')
            expect(pluralize.plural('mouse')).toBe('mice')
        })

    })


    describe('pluralize.singular', () => {

        test('regular singulars', () => {
            expect(pluralize.singular('cats')).toBe('cat')
            expect(pluralize.singular('dogs')).toBe('dog')
            expect(pluralize.singular('books')).toBe('book')
            expect(pluralize.singular('cars')).toBe('car')
        })


        test('words ending in es', () => {
            expect(pluralize.singular('buses')).toBe('bus')
            expect(pluralize.singular('boxes')).toBe('box')
            expect(pluralize.singular('churches')).toBe('church')
            expect(pluralize.singular('dishes')).toBe('dish')
        })


        test('words ending in ies', () => {
            expect(pluralize.singular('cities')).toBe('city')
            expect(pluralize.singular('flies')).toBe('fly')
            expect(pluralize.singular('stories')).toBe('story')
        })


        test('irregular singulars', () => {
            expect(pluralize.singular('children')).toBe('child')
            expect(pluralize.singular('people')).toBe('person')
            expect(pluralize.singular('men')).toBe('man')
            expect(pluralize.singular('women')).toBe('woman')
            expect(pluralize.singular('feet')).toBe('foot')
            expect(pluralize.singular('teeth')).toBe('tooth')
            expect(pluralize.singular('geese')).toBe('goose')
            expect(pluralize.singular('mice')).toBe('mouse')
        })

    })


    describe('pluralize.isPlural / pluralize.isSingular', () => {

        test('isPlural returns true for plural words', () => {
            expect(pluralize.isPlural('cats')).toBe(true)
            expect(pluralize.isPlural('children')).toBe(true)
            expect(pluralize.isPlural('people')).toBe(true)
        })


        test('isSingular returns true for singular words', () => {
            expect(pluralize.isSingular('cat')).toBe(true)
            expect(pluralize.isSingular('child')).toBe(true)
            expect(pluralize.isSingular('person')).toBe(true)
        })

    })


    describe('uncountables', () => {

        test('uncountable words stay the same', () => {
            expect(pluralize.plural('fish')).toBe('fish')
            expect(pluralize.singular('fish')).toBe('fish')

            expect(pluralize.plural('sheep')).toBe('sheep')
            expect(pluralize.singular('sheep')).toBe('sheep')

            expect(pluralize.plural('deer')).toBe('deer')
            expect(pluralize.singular('deer')).toBe('deer')

            expect(pluralize.plural('moose')).toBe('moose')
            expect(pluralize.singular('moose')).toBe('moose')
        })

    })


    describe('pluralize with count', () => {

        test('returns singular for count 1', () => {
            expect(pluralize('cat', 1)).toBe('cat')
            expect(pluralize('child', 1)).toBe('child')
        })


        test('returns plural for count != 1', () => {
            expect(pluralize('cat', 0)).toBe('cats')
            expect(pluralize('cat', 2)).toBe('cats')
            expect(pluralize('child', 5)).toBe('children')
        })


        test('includes count when inclusive is true', () => {
            expect(pluralize('cat', 1, true)).toBe('1 cat')
            expect(pluralize('cat', 3, true)).toBe('3 cats')
            expect(pluralize('child', 1, true)).toBe('1 child')
            expect(pluralize('child', 5, true)).toBe('5 children')
        })

    })


    describe('case preservation', () => {

        test('preserves lowercase', () => {
            expect(pluralize.plural('cat')).toBe('cats')
        })


        test('preserves uppercase', () => {
            expect(pluralize.plural('CAT')).toBe('CATS')
        })


        test('preserves title case', () => {
            expect(pluralize.plural('Cat')).toBe('Cats')
        })

    })

})
