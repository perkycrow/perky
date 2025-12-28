import {describe, test, expect, vi, beforeEach} from 'vitest'
import PerkyModule from '../perky_module'
import {setupLifecycle} from './lifecycle.js'


describe('lifecycle', () => {
    let host
    let child


    beforeEach(() => {
        host = new PerkyModule({$id: 'host'})
        child = new PerkyModule({$id: 'child'})
        child.install(host)
        host.childrenRegistry.set(child.$id, child)
    })


    describe('setupLifecycle', () => {

        test('does nothing when $lifecycle is false', () => {
            const startSpy = vi.spyOn(child, 'start')
            host.start()

            setupLifecycle(host, child, {$lifecycle: false})

            host.emit('start')

            expect(startSpy).not.toHaveBeenCalled()
        })


        test('starts child immediately if host is started and child has eagerStart', () => {
            host.start()
            const eagerChild = new PerkyModule({$id: 'eagerChild', $eagerStart: true})
            eagerChild.install(host)
            host.childrenRegistry.set(eagerChild.$id, eagerChild)

            setupLifecycle(host, eagerChild, {})

            expect(eagerChild.started).toBe(true)
        })


        test('does not start child immediately if host is not started', () => {
            const eagerChild = new PerkyModule({$id: 'eagerChild', $eagerStart: true})
            eagerChild.install(host)
            host.childrenRegistry.set(eagerChild.$id, eagerChild)

            setupLifecycle(host, eagerChild, {})

            expect(eagerChild.started).toBe(false)
        })


        test('does not start child immediately if eagerStart is false', () => {
            host.start()
            const lazyChild = new PerkyModule({$id: 'lazyChild', $eagerStart: false})
            lazyChild.install(host)
            host.childrenRegistry.set(lazyChild.$id, lazyChild)

            setupLifecycle(host, lazyChild, {})

            expect(lazyChild.started).toBe(false)
        })


        test('starts child when host emits start', () => {
            setupLifecycle(host, child, {})

            expect(child.started).toBe(false)

            host.start()

            expect(child.started).toBe(true)
        })


        test('stops child when host emits stop', () => {
            setupLifecycle(host, child, {})

            host.start()
            expect(child.started).toBe(true)

            host.stop()

            expect(child.started).toBe(false)
        })


        test('unregisters child when host disposes', () => {
            setupLifecycle(host, child, {})

            expect(host.hasChild('child')).toBe(true)

            host.dispose()

            expect(host.hasChild('child')).toBe(false)
        })


        test('unregisters child when child disposes', () => {
            setupLifecycle(host, child, {})

            expect(host.hasChild('child')).toBe(true)

            child.dispose()

            expect(host.hasChild('child')).toBe(false)
        })


        test('updates category index when $category changes', () => {
            setupLifecycle(host, child, {})
            child.$category = 'module'
            host.childrenRegistry.refreshIndexFor(child, '$category')

            expect(host.listNamesFor('module')).toContain('child')

            child.$category = 'service'

            expect(host.listNamesFor('module')).not.toContain('child')
            expect(host.listNamesFor('service')).toContain('child')
        })


        test('updates registry key when $id changes', () => {
            setupLifecycle(host, child, {})

            expect(host.hasChild('child')).toBe(true)
            expect(host.hasChild('newName')).toBe(false)

            child.$id = 'newName'

            expect(host.hasChild('child')).toBe(false)
            expect(host.hasChild('newName')).toBe(true)
        })


        test('updates host binding when $bind changes', () => {
            child.$bind = 'oldBinding'
            host[child.$bind] = child

            setupLifecycle(host, child, {})

            expect(host.oldBinding).toBe(child)

            child.$bind = 'newBinding'

            expect(host.oldBinding).toBeUndefined()
            expect(host.newBinding).toBe(child)
        })


        test('removes old binding when $bind changes to new value', () => {
            child.$bind = 'firstBinding'
            host.firstBinding = child

            setupLifecycle(host, child, {})

            child.$bind = 'secondBinding'

            expect(host.firstBinding).toBeUndefined()
            expect(host.secondBinding).toBe(child)
        })


        test('handles $bind change when old bind was not set on host', () => {
            setupLifecycle(host, child, {})

            child.$bind = 'newBinding'

            expect(host.newBinding).toBe(child)
        })


        test('does not remove other host properties when $bind changes', () => {
            host.otherProperty = 'value'
            child.$bind = 'childBinding'
            host.childBinding = child

            setupLifecycle(host, child, {})

            child.$bind = 'newBinding'

            expect(host.otherProperty).toBe('value')
        })
    })


    describe('lifecycle cascade', () => {

        test('nested children start when parent starts', () => {
            const grandchild = new PerkyModule({$id: 'grandchild'})
            grandchild.install(child)
            child.childrenRegistry.set(grandchild.$id, grandchild)

            setupLifecycle(host, child, {})
            setupLifecycle(child, grandchild, {})

            host.start()

            expect(child.started).toBe(true)
            expect(grandchild.started).toBe(true)
        })


        test('nested children stop when parent stops', () => {
            const grandchild = new PerkyModule({$id: 'grandchild'})
            grandchild.install(child)
            child.childrenRegistry.set(grandchild.$id, grandchild)

            setupLifecycle(host, child, {})
            setupLifecycle(child, grandchild, {})

            host.start()
            host.stop()

            expect(child.started).toBe(false)
            expect(grandchild.started).toBe(false)
        })
    })


    describe('integration with PerkyModule.create', () => {

        test('lifecycle is set up automatically via create', () => {
            const parent = new PerkyModule({$id: 'parent'})
            const createdChild = parent.create(PerkyModule, {$id: 'created'})

            parent.start()

            expect(createdChild.started).toBe(true)

            parent.stop()

            expect(createdChild.started).toBe(false)
        })


        test('$lifecycle: false prevents lifecycle setup via create', () => {
            const parent = new PerkyModule({$id: 'parent'})
            const createdChild = parent.create(PerkyModule, {
                $id: 'created',
                $lifecycle: false
            })

            parent.start()

            expect(createdChild.started).toBe(false)
        })


        test('$eagerStart: false prevents immediate start via create', () => {
            const parent = new PerkyModule({$id: 'parent'})
            parent.start()

            const createdChild = parent.create(PerkyModule, {
                $id: 'created',
                $eagerStart: false
            })

            expect(createdChild.started).toBe(false)
        })


        test('$eagerStart: true starts child immediately if parent is started', () => {
            const parent = new PerkyModule({$id: 'parent'})
            parent.start()

            const createdChild = parent.create(PerkyModule, {
                $id: 'created',
                $eagerStart: true
            })

            expect(createdChild.started).toBe(true)
        })
    })
})
