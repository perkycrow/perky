import {describe, test, expect, beforeEach, vi} from 'vitest'
import Stage from './stage.js'
import World from './world.js'
import Entity from './entity.js'
import EntityView from './entity_view.js'
import PerkyModule from '../core/perky_module.js'
import Group2D from '../render/group_2d.js'


describe('Stage', () => {

    let stage

    beforeEach(() => {
        stage = new Stage({game: {}})
    })


    test('extends PerkyModule', () => {
        expect(stage).toBeInstanceOf(PerkyModule)
    })


    test('has stage category', () => {
        expect(Stage.$category).toBe('stage')
    })


    test('stores game reference', () => {
        const game = {name: 'testGame'}
        const s = new Stage({game})

        expect(s.game).toBe(game)
    })


    test('has null World by default', () => {
        expect(Stage.World).toBe(null)
    })


    test('has null ActionController by default', () => {
        expect(Stage.ActionController).toBe(null)
    })


    test('has null camera by default', () => {
        expect(Stage.camera).toBe(null)
    })


    test('has null postPasses by default', () => {
        expect(Stage.postPasses).toBe(null)
    })


    test('does not create world when World is null', () => {
        expect(stage.world).toBeUndefined()
    })


    test('creates world when World is defined', () => {
        class TestStage extends Stage {
            static World = World
        }

        const s = new TestStage({game: {}})

        expect(s.world).toBeInstanceOf(World)
    })


    test('world is child of stage', () => {
        class TestStage extends Stage {
            static World = World
        }

        const s = new TestStage({game: {}})

        expect(s.getChild('world')).toBe(s.world)
    })


    test('has viewsGroup', () => {
        expect(stage.viewsGroup).toBeInstanceOf(Group2D)
    })


    test('update calls updateViews', () => {
        const spy = vi.spyOn(stage, 'updateViews')

        stage.update(0.016)

        expect(spy).toHaveBeenCalledWith(0.016)
    })


    test('update does not throw when no world', () => {
        expect(() => stage.update(0.016)).not.toThrow()
    })


    test('render is a no-op by default', () => {
        expect(() => stage.render()).not.toThrow()
    })


    test('subclass can override update', () => {
        const updateSpy = vi.fn()

        class TestStage extends Stage {
            update (deltaTime) {
                updateSpy(deltaTime)
            }
        }

        const s = new TestStage({game: {}})
        s.update(0.016)

        expect(updateSpy).toHaveBeenCalledWith(0.016)
    })


    test('subclass can override render', () => {
        const renderSpy = vi.fn()

        class TestStage extends Stage {
            render () {
                renderSpy()
            }
        }

        const s = new TestStage({game: {}})
        s.render()

        expect(renderSpy).toHaveBeenCalled()
    })


    test('disposing stage disposes world', () => {
        class TestStage extends Stage {
            static World = World
        }

        const s = new TestStage({game: {}})
        const world = s.world

        s.dispose()

        expect(world.disposed).toBe(true)
    })


    describe('view registration', () => {

        class TestEntity extends Entity {}
        class TestView extends EntityView {}


        test('register adds class to registry', () => {
            stage.register(TestEntity, TestView)

            expect(stage.unregister(TestEntity)).toBe(true)
        })


        test('register returns stage for chaining', () => {
            const result = stage.register(TestEntity, TestView)

            expect(result).toBe(stage)
        })


        test('register supports matcher function', () => {
            const matcher = (entity) => entity.type === 'enemy'

            stage.register(matcher, TestView)

            expect(stage.unregister(matcher)).toBe(true)
        })


        test('unregister removes class from registry', () => {
            stage.register(TestEntity, TestView)
            stage.unregister(TestEntity)

            expect(stage.unregister(TestEntity)).toBe(false)
        })


        test('unregister returns false for non-existent class', () => {
            expect(stage.unregister(TestEntity)).toBe(false)
        })


        test('clearRegistry removes all registrations', () => {
            stage.register(TestEntity, TestView)
            stage.clearRegistry()

            expect(stage.unregister(TestEntity)).toBe(false)
        })


        test('clearRegistry returns stage for chaining', () => {
            const result = stage.clearRegistry()

            expect(result).toBe(stage)
        })


        test('getViews returns empty array for unknown entity', () => {
            expect(stage.getViews('unknown')).toEqual([])
        })

    })


    describe('view lifecycle', () => {

        class TestWorld extends World {}
        class TestEntity extends Entity {}
        class TestView extends EntityView {}


        test('creates view when entity is added to world', () => {
            class TestStage extends Stage {
                static World = TestWorld
            }

            const s = new TestStage({game: {}})
            s.register(TestEntity, TestView)
            s.start()

            s.world.create(TestEntity, {$id: 'test-entity'})

            const views = s.getViews('test-entity')
            expect(views.length).toBe(1)
            expect(views[0]).toBeInstanceOf(TestView)
        })


        test('removes view when entity is removed from world', () => {
            class TestStage extends Stage {
                static World = TestWorld
            }

            const s = new TestStage({game: {}})
            s.register(TestEntity, TestView)
            s.start()

            s.world.create(TestEntity, {$id: 'test-entity'})
            expect(s.getViews('test-entity').length).toBe(1)

            s.world.removeChild('test-entity')
            expect(s.getViews('test-entity').length).toBe(0)
        })


        test('syncViews calls sync on all views', () => {
            class TestStage extends Stage {
                static World = TestWorld
            }

            const s = new TestStage({game: {}})
            s.register(TestEntity, TestView)
            s.start()

            s.world.create(TestEntity, {$id: 'test-entity'})

            const views = s.getViews('test-entity')
            const syncSpy = vi.spyOn(views[0], 'sync')

            s.syncViews()

            expect(syncSpy).toHaveBeenCalled()
        })


        test('updateViews calls update on all views', () => {
            class TestStage extends Stage {
                static World = TestWorld
            }

            const s = new TestStage({game: {}})
            s.register(TestEntity, TestView)
            s.start()

            s.world.create(TestEntity, {$id: 'test-entity'})

            const views = s.getViews('test-entity')
            views[0].update = vi.fn()

            s.updateViews(0.016)

            expect(views[0].update).toHaveBeenCalledWith(0.016)
        })


        test('emits view:added when view is created', () => {
            class TestStage extends Stage {
                static World = TestWorld
            }

            const s = new TestStage({game: {}})
            s.register(TestEntity, TestView)
            s.start()

            const spy = vi.fn()
            s.on('view:added', spy)

            s.world.create(TestEntity, {$id: 'test-entity'})

            expect(spy).toHaveBeenCalledWith('test-entity', expect.any(Array))
        })


        test('emits view:removed when view is destroyed', () => {
            class TestStage extends Stage {
                static World = TestWorld
            }

            const s = new TestStage({game: {}})
            s.register(TestEntity, TestView)
            s.start()

            s.world.create(TestEntity, {$id: 'test-entity'})

            const spy = vi.fn()
            s.on('view:removed', spy)

            s.world.removeChild('test-entity')

            expect(spy).toHaveBeenCalledWith('test-entity', expect.any(Array))
        })

    })


    describe('nested entity views', () => {

        class TestWorld extends World {}
        class ParentEntity extends Entity {}
        class ChildEntity extends Entity {}

        class ParentView extends EntityView {

            constructor (entity, context) {
                super(entity, context)
                this.root = new Group2D({x: entity.x, y: entity.y})
            }

        }

        class ChildView extends EntityView {

            constructor (entity, context) {
                super(entity, context)
                this.root = new Group2D({x: entity.x, y: entity.y})
            }

        }


        test('child entity view is added to parent view root', () => {
            class TestStage extends Stage {
                static World = TestWorld
            }

            const s = new TestStage({game: {}})
            s.register(ParentEntity, ParentView)
            s.register(ChildEntity, ChildView)
            s.start()

            const parent = s.world.create(ParentEntity, {$id: 'parent'})
            parent.create(ChildEntity, {$id: 'child'})

            const parentViews = s.getViews('parent')
            const childViews = s.getViews('child')

            expect(parentViews[0].root.children).toContain(childViews[0].root)
        })


        test('child view is not added to viewsGroup directly', () => {
            class TestStage extends Stage {
                static World = TestWorld
            }

            const s = new TestStage({game: {}})
            s.register(ParentEntity, ParentView)
            s.register(ChildEntity, ChildView)
            s.start()

            const parent = s.world.create(ParentEntity, {$id: 'parent'})
            parent.create(ChildEntity, {$id: 'child'})

            const childViews = s.getViews('child')

            expect(s.viewsGroup.children).not.toContain(childViews[0].root)
        })


        test('parent view root is added to viewsGroup', () => {
            class TestStage extends Stage {
                static World = TestWorld
            }

            const s = new TestStage({game: {}})
            s.register(ParentEntity, ParentView)
            s.start()

            s.world.create(ParentEntity, {$id: 'parent'})

            const parentViews = s.getViews('parent')

            expect(s.viewsGroup.children).toContain(parentViews[0].root)
        })


        test('removing parent entity removes child views', () => {
            class TestStage extends Stage {
                static World = TestWorld
            }

            const s = new TestStage({game: {}})
            s.register(ParentEntity, ParentView)
            s.register(ChildEntity, ChildView)
            s.start()

            const parent = s.world.create(ParentEntity, {$id: 'parent'})
            parent.create(ChildEntity, {$id: 'child'})

            s.world.removeChild('parent')

            expect(s.getViews('parent').length).toBe(0)
            expect(s.getViews('child').length).toBe(0)
        })


        test('child view context.group points to parent view root', () => {
            class TestStage extends Stage {
                static World = TestWorld
            }

            const s = new TestStage({game: {}})
            s.register(ParentEntity, ParentView)
            s.register(ChildEntity, ChildView)
            s.start()

            const parent = s.world.create(ParentEntity, {$id: 'parent'})
            parent.create(ChildEntity, {$id: 'child'})

            const parentViews = s.getViews('parent')
            const childViews = s.getViews('child')

            expect(childViews[0].context.group).toBe(parentViews[0].root)
        })


        test('unregistered parent entity passes group to children', () => {
            class TestStage extends Stage {
                static World = TestWorld
            }

            const s = new TestStage({game: {}})
            s.register(ChildEntity, ChildView)
            s.start()

            const parent = s.world.create(ParentEntity, {$id: 'parent'})
            parent.create(ChildEntity, {$id: 'child'})

            const childViews = s.getViews('child')

            expect(s.viewsGroup.children).toContain(childViews[0].root)
        })


        test('deeply nested entities', () => {
            class GrandchildEntity extends Entity {}
            class GrandchildView extends EntityView {

                constructor (entity, context) {
                    super(entity, context)
                    this.root = new Group2D()
                }

            }

            class TestStage extends Stage {
                static World = TestWorld
            }

            const s = new TestStage({game: {}})
            s.register(ParentEntity, ParentView)
            s.register(ChildEntity, ChildView)
            s.register(GrandchildEntity, GrandchildView)
            s.start()

            const parent = s.world.create(ParentEntity, {$id: 'parent'})
            const child = parent.create(ChildEntity, {$id: 'child'})
            child.create(GrandchildEntity, {$id: 'grandchild'})

            const parentRoot = s.getViews('parent')[0].root
            const childRoot = s.getViews('child')[0].root
            const grandchildRoot = s.getViews('grandchild')[0].root

            expect(parentRoot.children).toContain(childRoot)
            expect(childRoot.children).toContain(grandchildRoot)
        })


        test('entities with same $id under different parents get separate views', () => {
            class ContainerEntity extends Entity {}

            class TestStage extends Stage {
                static World = TestWorld
            }

            const s = new TestStage({game: {}})
            s.register(ChildEntity, ChildView)
            s.start()

            const containerA = s.world.create(ContainerEntity, {$id: 'containerA'})
            const containerB = s.world.create(ContainerEntity, {$id: 'containerB'})

            const childA = containerA.create(ChildEntity, {$id: 'child'})
            const childB = containerB.create(ChildEntity, {$id: 'child'})

            const viewsA = s.getViews(childA)
            const viewsB = s.getViews(childB)

            expect(viewsA.length).toBe(1)
            expect(viewsB.length).toBe(1)
            expect(viewsA[0]).not.toBe(viewsB[0])
        })


        test('updateViews calls update on all views even with $id collisions', () => {
            class ContainerEntity extends Entity {}

            class TestStage extends Stage {
                static World = TestWorld
            }

            const s = new TestStage({game: {}})
            s.register(ChildEntity, ChildView)
            s.start()

            const containerA = s.world.create(ContainerEntity, {$id: 'containerA'})
            const containerB = s.world.create(ContainerEntity, {$id: 'containerB'})

            const childA = containerA.create(ChildEntity, {$id: 'child'})
            const childB = containerB.create(ChildEntity, {$id: 'child'})

            const viewA = s.getViews(childA)[0]
            const viewB = s.getViews(childB)[0]
            viewA.update = vi.fn()
            viewB.update = vi.fn()

            s.updateViews(0.016)

            expect(viewA.update).toHaveBeenCalledWith(0.016)
            expect(viewB.update).toHaveBeenCalledWith(0.016)
        })

    })


    describe('runtime postPasses', () => {

        test('addPostPass adds pass via game renderer', () => {
            const mockPass = {$id: 'testPass'}
            const mockRenderer = {
                addPostPass: vi.fn(() => mockPass),
                removePostPass: vi.fn()
            }
            const mockGame = {
                getRenderer: vi.fn(() => mockRenderer)
            }

            const s = new Stage({game: mockGame})
            const result = s.addPostPass('TestPass')

            expect(mockGame.getRenderer).toHaveBeenCalledWith('game')
            expect(mockRenderer.addPostPass).toHaveBeenCalledWith('TestPass')
            expect(result).toBe(mockPass)
        })


        test('addPostPass returns undefined when no renderer', () => {
            const mockGame = {
                getRenderer: vi.fn(() => null)
            }

            const s = new Stage({game: mockGame})
            const result = s.addPostPass('TestPass')

            expect(result).toBeUndefined()
        })


        test('removePostPass removes pass via game renderer', () => {
            const mockPass = {$id: 'testPass'}
            const mockRenderer = {
                addPostPass: vi.fn(() => mockPass),
                removePostPass: vi.fn()
            }
            const mockGame = {
                getRenderer: vi.fn(() => mockRenderer)
            }

            const s = new Stage({game: mockGame})
            s.addPostPass('TestPass')
            s.removePostPass(mockPass)

            expect(mockRenderer.removePostPass).toHaveBeenCalledWith(mockPass)
        })


        test('runtime postPasses are cleaned up on stop', () => {
            const mockPass1 = {$id: 'pass1'}
            const mockPass2 = {$id: 'pass2'}
            let callCount = 0
            const mockRenderer = {
                addPostPass: vi.fn(() => {
                    callCount++
                    return callCount === 1 ? mockPass1 : mockPass2
                }),
                removePostPass: vi.fn()
            }
            const mockGame = {
                getRenderer: vi.fn(() => mockRenderer)
            }

            const s = new Stage({game: mockGame})
            s.addPostPass('Pass1')
            s.addPostPass('Pass2')

            s.start()
            s.stop()

            expect(mockRenderer.removePostPass).toHaveBeenCalledWith(mockPass1)
            expect(mockRenderer.removePostPass).toHaveBeenCalledWith(mockPass2)
        })


        test('manually removed postPasses are not cleaned up twice', () => {
            const mockPass = {$id: 'testPass'}
            const mockRenderer = {
                addPostPass: vi.fn(() => mockPass),
                removePostPass: vi.fn()
            }
            const mockGame = {
                getRenderer: vi.fn(() => mockRenderer)
            }

            const s = new Stage({game: mockGame})
            s.addPostPass('TestPass')
            s.removePostPass(mockPass)

            s.start()
            s.stop()

            expect(mockRenderer.removePostPass).toHaveBeenCalledTimes(1)
        })

    })

})
