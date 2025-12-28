/* eslint-disable max-nested-callbacks */

import {describe, test, expect, vi, beforeEach} from 'vitest'
import PerkyModule from '../perky_module'
import Registry from '../registry'
import ObservableSet from '../observable_set'
import {
    setupTagIndexListeners,
    createTagsIndex,
    deleteTagsIndex,
    queryChildrenByTags,
    hasTag,
    addTag,
    removeTag,
    hasTags,
    childrenByTags,
    addTagsIndex,
    removeTagsIndex
} from './tags.js'


describe('tags', () => {

    describe('hasTag', () => {
        test('returns true when tag exists', () => {
            const module = {tags: new ObservableSet(['enemy', 'collidable'])}

            expect(hasTag.call(module, 'enemy')).toBe(true)
            expect(hasTag.call(module, 'collidable')).toBe(true)
        })


        test('returns false when tag does not exist', () => {
            const module = {tags: new ObservableSet(['enemy'])}

            expect(hasTag.call(module, 'friendly')).toBe(false)
        })


        test('returns false when no tags', () => {
            const module = {tags: new ObservableSet()}

            expect(hasTag.call(module, 'enemy')).toBe(false)
        })
    })


    describe('addTag', () => {
        test('adds a new tag and returns true', () => {
            const module = {tags: new ObservableSet()}

            const result = addTag.call(module, 'enemy')

            expect(result).toBe(true)
            expect(module.tags.has('enemy')).toBe(true)
        })


        test('returns false when tag already exists', () => {
            const module = {tags: new ObservableSet(['enemy'])}

            const result = addTag.call(module, 'enemy')

            expect(result).toBe(false)
        })
    })


    describe('removeTag', () => {
        test('removes existing tag and returns true', () => {
            const module = {tags: new ObservableSet(['enemy', 'collidable'])}

            const result = removeTag.call(module, 'enemy')

            expect(result).toBe(true)
            expect(module.tags.has('enemy')).toBe(false)
            expect(module.tags.has('collidable')).toBe(true)
        })


        test('returns false when tag does not exist', () => {
            const module = {tags: new ObservableSet()}

            const result = removeTag.call(module, 'enemy')

            expect(result).toBe(false)
        })
    })


    describe('hasTags', () => {
        test('returns true when all tags exist (array)', () => {
            const module = {
                tags: new ObservableSet(['enemy', 'collidable', 'flying']),
                hasTag: hasTag
            }

            expect(hasTags.call(module, ['enemy', 'collidable'])).toBe(true)
            expect(hasTags.call(module, ['enemy'])).toBe(true)
        })


        test('returns false when some tags missing (array)', () => {
            const module = {
                tags: new ObservableSet(['enemy', 'collidable']),
                hasTag: hasTag
            }

            expect(hasTags.call(module, ['enemy', 'flying'])).toBe(false)
        })


        test('accepts string and checks single tag', () => {
            const module = {
                tags: new ObservableSet(['enemy', 'collidable']),
                hasTag: hasTag
            }

            expect(hasTags.call(module, 'enemy')).toBe(true)
            expect(hasTags.call(module, 'friendly')).toBe(false)
        })


        test('returns true for empty array', () => {
            const module = {
                tags: new ObservableSet(['enemy']),
                hasTag: hasTag
            }

            expect(hasTags.call(module, [])).toBe(true)
        })
    })


    describe('createTagsIndex', () => {
        let tagIndexes
        let childrenRegistry


        beforeEach(() => {
            tagIndexes = new Map()
            childrenRegistry = new Registry()
        })


        test('creates composite index and returns true', () => {
            const result = createTagsIndex(
                ['enemy', 'collidable'],
                tagIndexes,
                childrenRegistry,
                () => {}
            )

            expect(result).toBe(true)
            expect(childrenRegistry.hasIndex('collidable_enemy')).toBe(true)
            expect(tagIndexes.has('collidable_enemy')).toBe(true)
        })


        test('normalizes tag order (alphabetical)', () => {
            createTagsIndex(['collidable', 'enemy'], tagIndexes, childrenRegistry, () => {})

            expect(childrenRegistry.hasIndex('collidable_enemy')).toBe(true)
        })


        test('returns false if already indexed', () => {
            createTagsIndex(['enemy', 'collidable'], tagIndexes, childrenRegistry, () => {})
            const result = createTagsIndex(['enemy', 'collidable'], tagIndexes, childrenRegistry, () => {})

            expect(result).toBe(false)
        })


        test('returns false for empty array', () => {
            const result = createTagsIndex([], tagIndexes, childrenRegistry, () => {})

            expect(result).toBe(false)
        })


        test('returns false for non-array', () => {
            const result = createTagsIndex('invalid', tagIndexes, childrenRegistry, () => {})

            expect(result).toBe(false)
        })


        test('sets up listeners for existing children', () => {
            const child = {tags: new ObservableSet(['enemy'])}
            childrenRegistry.set('child', child)

            const setupFn = vi.fn()
            createTagsIndex(['enemy', 'collidable'], tagIndexes, childrenRegistry, setupFn)

            expect(setupFn).toHaveBeenCalledWith(child)
        })


        test('does not call setup for children without tags', () => {
            const child = {}
            childrenRegistry.set('child', child)

            const setupFn = vi.fn()
            createTagsIndex(['enemy', 'collidable'], tagIndexes, childrenRegistry, setupFn)

            expect(setupFn).not.toHaveBeenCalled()
        })
    })


    describe('deleteTagsIndex', () => {
        let tagIndexes
        let childrenRegistry


        beforeEach(() => {
            tagIndexes = new Map()
            childrenRegistry = new Registry()
        })


        test('removes index and returns true', () => {
            createTagsIndex(['enemy', 'collidable'], tagIndexes, childrenRegistry, () => {})

            const result = deleteTagsIndex(['enemy', 'collidable'], tagIndexes, childrenRegistry)

            expect(result).toBe(true)
            expect(childrenRegistry.hasIndex('collidable_enemy')).toBe(false)
            expect(tagIndexes.has('collidable_enemy')).toBe(false)
        })


        test('returns false if not indexed', () => {
            const result = deleteTagsIndex(['enemy', 'collidable'], tagIndexes, childrenRegistry)

            expect(result).toBe(false)
        })
    })


    describe('queryChildrenByTags', () => {
        let tagIndexes
        let childrenRegistry


        beforeEach(() => {
            tagIndexes = new Map()
            childrenRegistry = new Registry()
        })


        test('returns children matching all tags (without index)', () => {
            const child1 = {$tags: ['enemy', 'collidable']}
            const child2 = {$tags: ['enemy', 'collidable', 'flying']}
            const child3 = {$tags: ['friendly', 'collidable']}

            childrenRegistry.set('c1', child1)
            childrenRegistry.set('c2', child2)
            childrenRegistry.set('c3', child3)

            const result = queryChildrenByTags(['enemy', 'collidable'], tagIndexes, childrenRegistry)

            expect(result).toHaveLength(2)
            expect(result).toContain(child1)
            expect(result).toContain(child2)
        })


        test('returns empty array for no matches', () => {
            const child = {$tags: ['enemy']}
            childrenRegistry.set('c1', child)

            const result = queryChildrenByTags(['enemy', 'collidable'], tagIndexes, childrenRegistry)

            expect(result).toEqual([])
        })


        test('returns empty array for empty tags', () => {
            const result = queryChildrenByTags([], tagIndexes, childrenRegistry)

            expect(result).toEqual([])
        })


        test('accepts string for single tag query', () => {
            const child1 = {$tags: ['enemy']}
            const child2 = {$tags: ['friendly']}

            childrenRegistry.set('c1', child1)
            childrenRegistry.set('c2', child2)

            const result = queryChildrenByTags('enemy', tagIndexes, childrenRegistry)

            expect(result).toEqual([child1])
        })


        test('uses index when available', () => {
            const child1 = {tags: new ObservableSet(['enemy', 'collidable']), $tags: ['enemy', 'collidable']}
            const child2 = {tags: new ObservableSet(['enemy']), $tags: ['enemy']}

            childrenRegistry.set('c1', child1)
            childrenRegistry.set('c2', child2)

            createTagsIndex(['enemy', 'collidable'], tagIndexes, childrenRegistry, () => {})

            const result = queryChildrenByTags(['enemy', 'collidable'], tagIndexes, childrenRegistry)

            expect(result).toHaveLength(1)
            expect(result).toContain(child1)
        })
    })


    describe('setupTagIndexListeners', () => {
        let tagIndexes
        let childrenRegistry


        beforeEach(() => {
            tagIndexes = new Map()
            childrenRegistry = new Registry()
        })


        test('does nothing when tagIndexes is empty', () => {
            const child = new PerkyModule({$id: 'child', $tags: ['enemy']})
            childrenRegistry.set('child', child)

            const listenToSpy = vi.spyOn(child, 'listenTo')

            setupTagIndexListeners(child, tagIndexes, childrenRegistry)

            expect(listenToSpy).not.toHaveBeenCalled()
        })


        test('does nothing when child has no tags', () => {
            tagIndexes.set('collidable_enemy', ['enemy', 'collidable'])
            const child = {}

            setupTagIndexListeners(child, tagIndexes, childrenRegistry)
        })


        test('refreshes indexes when tag is added', () => {
            const child = new PerkyModule({$id: 'child', $tags: ['enemy']})
            childrenRegistry.set('child', child)

            createTagsIndex(['enemy', 'collidable'], tagIndexes, childrenRegistry, () => {})
            setupTagIndexListeners(child, tagIndexes, childrenRegistry)

            expect(queryChildrenByTags(['enemy', 'collidable'], tagIndexes, childrenRegistry)).toHaveLength(0)

            child.tags.add('collidable')

            expect(queryChildrenByTags(['enemy', 'collidable'], tagIndexes, childrenRegistry)).toHaveLength(1)
        })


        test('refreshes indexes when tag is deleted', () => {
            const child = new PerkyModule({$id: 'child', $tags: ['enemy', 'collidable']})
            childrenRegistry.set('child', child)

            createTagsIndex(['enemy', 'collidable'], tagIndexes, childrenRegistry, () => {})
            setupTagIndexListeners(child, tagIndexes, childrenRegistry)

            expect(queryChildrenByTags(['enemy', 'collidable'], tagIndexes, childrenRegistry)).toHaveLength(1)

            child.tags.delete('collidable')

            expect(queryChildrenByTags(['enemy', 'collidable'], tagIndexes, childrenRegistry)).toHaveLength(0)
        })


        test('refreshes indexes when tags are cleared', () => {
            const child = new PerkyModule({$id: 'child', $tags: ['enemy', 'collidable']})
            childrenRegistry.set('child', child)

            createTagsIndex(['enemy', 'collidable'], tagIndexes, childrenRegistry, () => {})
            setupTagIndexListeners(child, tagIndexes, childrenRegistry)

            expect(queryChildrenByTags(['enemy', 'collidable'], tagIndexes, childrenRegistry)).toHaveLength(1)

            child.tags.clear()

            expect(queryChildrenByTags(['enemy', 'collidable'], tagIndexes, childrenRegistry)).toHaveLength(0)
        })
    })


    describe('integration with PerkyModule', () => {
        let parent


        beforeEach(() => {
            parent = new PerkyModule({$id: 'parent'})
        })


        describe('childrenByTags', () => {
            test('returns children matching all tags', () => {
                const child1 = parent.create(PerkyModule, {$id: 'c1', $tags: ['enemy', 'collidable']})
                const child2 = parent.create(PerkyModule, {$id: 'c2', $tags: ['enemy', 'collidable', 'flying']})
                parent.create(PerkyModule, {$id: 'c3', $tags: ['friendly']})

                const result = childrenByTags.call(parent, ['enemy', 'collidable'])

                expect(result).toHaveLength(2)
                expect(result).toContain(child1)
                expect(result).toContain(child2)
            })


            test('accepts string for single tag', () => {
                const child1 = parent.create(PerkyModule, {$id: 'c1', $tags: ['enemy']})
                parent.create(PerkyModule, {$id: 'c2', $tags: ['friendly']})

                const result = childrenByTags.call(parent, 'enemy')

                expect(result).toEqual([child1])
            })
        })


        describe('addTagsIndex', () => {
            test('creates index', () => {
                const result = addTagsIndex.call(parent, ['enemy', 'collidable'])

                expect(result).toBe(true)
                expect(parent.childrenRegistry.hasIndex('collidable_enemy')).toBe(true)
            })


            test('returns false for duplicate', () => {
                addTagsIndex.call(parent, ['enemy', 'collidable'])
                const result = addTagsIndex.call(parent, ['enemy', 'collidable'])

                expect(result).toBe(false)
            })
        })


        describe('removeTagsIndex', () => {
            test('removes index', () => {
                addTagsIndex.call(parent, ['enemy', 'collidable'])
                const result = removeTagsIndex.call(parent, ['enemy', 'collidable'])

                expect(result).toBe(true)
                expect(parent.childrenRegistry.hasIndex('collidable_enemy')).toBe(false)
            })


            test('returns false if not indexed', () => {
                const result = removeTagsIndex.call(parent, ['enemy', 'collidable'])

                expect(result).toBe(false)
            })
        })


        describe('dynamic tag updates with indexes', () => {
            test('index updates when child tags change', () => {
                parent.addTagsIndex(['enemy', 'collidable'])

                const child = parent.create(PerkyModule, {$id: 'child', $tags: ['enemy']})

                expect(parent.childrenByTags(['enemy', 'collidable'])).toHaveLength(0)

                child.tags.add('collidable')

                expect(parent.childrenByTags(['enemy', 'collidable'])).toHaveLength(1)
            })


            test('multiple indexes update independently', () => {
                parent.addTagsIndex(['enemy', 'collidable'])
                parent.addTagsIndex(['enemy', 'flying'])

                const child = parent.create(PerkyModule, {$id: 'child', $tags: ['enemy']})

                child.tags.add('collidable')
                expect(parent.childrenByTags(['enemy', 'collidable'])).toHaveLength(1)
                expect(parent.childrenByTags(['enemy', 'flying'])).toHaveLength(0)

                child.tags.add('flying')
                expect(parent.childrenByTags(['enemy', 'flying'])).toHaveLength(1)
            })
        })
    })
})
