import {describe, test, expect, vi, beforeEach} from 'vitest'
import PerkyModule from '../perky_module'
import {
    unregisterExisting,
    unregisterChild,
    getChild,
    hasChild,
    listNamesFor,
    removeChild,
    lookup,
    childrenByCategory
} from './children.js'


describe('children', () => {
    let parent

    beforeEach(() => {
        parent = new PerkyModule({$id: 'parent'})
    })


    describe('unregisterExisting', () => {
        test('unregisters child when it exists', () => {
            const child = parent.create(PerkyModule, {$id: 'child'})
            const disposeSpy = vi.spyOn(child, 'dispose')

            unregisterExisting(parent, 'child')

            expect(parent.hasChild('child')).toBe(false)
            expect(disposeSpy).toHaveBeenCalled()
        })


        test('does nothing when child does not exist', () => {
            unregisterExisting(parent, 'nonexistent')

            expect(parent.hasChild('nonexistent')).toBe(false)
        })
    })


    describe('unregisterChild', () => {
        test('removes child from registry', () => {
            const child = parent.create(PerkyModule, {$id: 'child'})

            unregisterChild(parent, child)

            expect(parent.hasChild('child')).toBe(false)
        })


        test('removes binding from host', () => {
            const child = parent.create(PerkyModule, {
                $id: 'child',
                $bind: 'myChild'
            })

            expect(parent.myChild).toBe(child)

            unregisterChild(parent, child)

            expect(parent.myChild).toBeUndefined()
        })


        test('calls uninstall on child', () => {
            const child = parent.create(PerkyModule, {$id: 'child'})
            const uninstallSpy = vi.spyOn(child, 'uninstall')

            unregisterChild(parent, child)

            expect(uninstallSpy).toHaveBeenCalled()
        })


        test('calls dispose on child', () => {
            const child = parent.create(PerkyModule, {$id: 'child'})
            const disposeSpy = vi.spyOn(child, 'dispose')

            unregisterChild(parent, child)

            expect(disposeSpy).toHaveBeenCalled()
        })


        test('emits category:delete event on host', () => {
            const child = parent.create(PerkyModule, {
                $id: 'child',
                $category: 'testCategory'
            })
            const emitSpy = vi.spyOn(parent, 'emit')

            unregisterChild(parent, child)

            expect(emitSpy).toHaveBeenCalledWith('testCategory:delete', 'child', child)
        })


        test('emits unregistered event on child', () => {
            const child = parent.create(PerkyModule, {$id: 'child'})
            const emitSpy = vi.spyOn(child, 'emit')

            unregisterChild(parent, child)

            expect(emitSpy).toHaveBeenCalledWith('unregistered', parent, 'child')
        })
    })


    describe('getChild', () => {
        test('returns child when it exists', () => {
            const child = parent.create(PerkyModule, {$id: 'child'})

            expect(getChild.call(parent, 'child')).toBe(child)
        })


        test('returns null when child does not exist', () => {
            expect(getChild.call(parent, 'nonexistent')).toBeNull()
        })
    })


    describe('hasChild', () => {
        test('returns true when child exists', () => {
            parent.create(PerkyModule, {$id: 'child'})

            expect(hasChild.call(parent, 'child')).toBe(true)
        })


        test('returns false when child does not exist', () => {
            expect(hasChild.call(parent, 'nonexistent')).toBe(false)
        })
    })


    describe('listNamesFor', () => {
        test('returns names for given category', () => {
            parent.create(PerkyModule, {$id: 'child1', $category: 'module'})
            parent.create(PerkyModule, {$id: 'child2', $category: 'module'})
            parent.create(PerkyModule, {$id: 'child3', $category: 'service'})

            const moduleNames = listNamesFor.call(parent, 'module')

            expect(moduleNames).toHaveLength(2)
            expect(moduleNames).toContain('child1')
            expect(moduleNames).toContain('child2')
        })


        test('returns empty array for non-existent category', () => {
            const names = listNamesFor.call(parent, 'nonexistent')

            expect(names).toEqual([])
        })


        test('uses custom index name', () => {
            parent.childrenRegistry.addIndex('customIndex', (item) => item.customValue) // eslint-disable-line max-nested-callbacks

            const child = parent.create(PerkyModule, {$id: 'child'})
            child.customValue = 'test'
            parent.childrenRegistry.refreshIndexFor(child, 'customIndex')

            const names = listNamesFor.call(parent, 'test', 'customIndex')

            expect(names).toContain('child')
        })
    })


    describe('removeChild', () => {
        test('removes existing child and returns true', () => {
            const child = parent.create(PerkyModule, {$id: 'child'})
            const disposeSpy = vi.spyOn(child, 'dispose')

            const result = removeChild.call(parent, 'child')

            expect(result).toBe(true)
            expect(parent.hasChild('child')).toBe(false)
            expect(disposeSpy).toHaveBeenCalled()
        })


        test('returns false for non-existent child', () => {
            const result = removeChild.call(parent, 'nonexistent')

            expect(result).toBe(false)
        })
    })


    describe('lookup', () => {
        test('returns children matching index value', () => {
            const child1 = parent.create(PerkyModule, {$id: 'child1', $category: 'module'})
            const child2 = parent.create(PerkyModule, {$id: 'child2', $category: 'module'})
            parent.create(PerkyModule, {$id: 'child3', $category: 'service'})

            const modules = lookup.call(parent, '$category', 'module')

            expect(modules).toHaveLength(2)
            expect(modules).toContain(child1)
            expect(modules).toContain(child2)
        })


        test('returns empty array for non-existent value', () => {
            const result = lookup.call(parent, '$category', 'nonexistent')

            expect(result).toEqual([])
        })
    })


    describe('childrenByCategory', () => {
        test('returns children matching category', () => {
            const child1 = parent.create(PerkyModule, {$id: 'child1', $category: 'enemy'})
            const child2 = parent.create(PerkyModule, {$id: 'child2', $category: 'enemy'})
            parent.create(PerkyModule, {$id: 'child3', $category: 'player'})

            const enemies = childrenByCategory.call(parent, 'enemy')

            expect(enemies).toHaveLength(2)
            expect(enemies).toContain(child1)
            expect(enemies).toContain(child2)
        })


        test('returns empty array for non-existent category', () => {
            const result = childrenByCategory.call(parent, 'nonexistent')

            expect(result).toEqual([])
        })
    })
})
