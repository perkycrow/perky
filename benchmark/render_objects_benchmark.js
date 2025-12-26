import {test} from 'vitest'
import PerkyModule from '../core/perky_module'
import Notifier from '../core/notifier'
import Transform2D from '../render/transform_2d'
import Object2D from '../render/object_2d'
import Sprite2D from '../render/sprite_2d'
import Group2D from '../render/group_2d'


const ITERATIONS = 1000


function benchmark (name, fn) {
    const start = performance.now()
    const results = fn()
    const end = performance.now()
    const duration = (end - start).toFixed(2)
    console.log(`${name}: ${duration}ms`)
    return {name, duration: parseFloat(duration), results}
}


function measureMemory (name, fn) {
    if (global.gc) {
        global.gc()
    }
    const before = process.memoryUsage().heapUsed
    const results = fn()
    const after = process.memoryUsage().heapUsed
    const diff = ((after - before) / 1024).toFixed(2)
    console.log(`${name} memory: ${diff}KB`)
    return {name, memory: parseFloat(diff), results}
}


console.log(`\n=== Benchmark: ${ITERATIONS} objects ===\n`)


console.log('--- Instantiation time ---')

benchmark('Plain objects', () => {
    const objects = []
    for (let i = 0; i < ITERATIONS; i++) {
        objects.push({
            id: `obj-${i}`,
            x: 0,
            y: 0,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            children: [],
            parent: null
        })
    }
    return objects
})


benchmark('Transform2D', () => {
    const objects = []
    for (let i = 0; i < ITERATIONS; i++) {
        objects.push(new Transform2D())
    }
    return objects
})


benchmark('Object2D', () => {
    const objects = []
    for (let i = 0; i < ITERATIONS; i++) {
        objects.push(new Object2D({x: i, y: i}))
    }
    return objects
})


benchmark('Sprite2D', () => {
    const objects = []
    for (let i = 0; i < ITERATIONS; i++) {
        objects.push(new Sprite2D({x: i, y: i}))
    }
    return objects
})


benchmark('Group2D', () => {
    const objects = []
    for (let i = 0; i < ITERATIONS; i++) {
        objects.push(new Group2D({x: i, y: i}))
    }
    return objects
})


benchmark('Notifier', () => {
    const objects = []
    for (let i = 0; i < ITERATIONS; i++) {
        objects.push(new Notifier())
    }
    return objects
})


benchmark('PerkyModule', () => {
    const objects = []
    for (let i = 0; i < ITERATIONS; i++) {
        objects.push(new PerkyModule({$id: `mod-${i}`}))
    }
    return objects
})


console.log('\n--- Memory usage ---')

measureMemory('Plain objects', () => {
    const objects = []
    for (let i = 0; i < ITERATIONS; i++) {
        objects.push({
            id: `obj-${i}`,
            x: 0,
            y: 0,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            children: [],
            parent: null
        })
    }
    return objects
})


measureMemory('Transform2D', () => {
    const objects = []
    for (let i = 0; i < ITERATIONS; i++) {
        objects.push(new Transform2D())
    }
    return objects
})


measureMemory('Object2D', () => {
    const objects = []
    for (let i = 0; i < ITERATIONS; i++) {
        objects.push(new Object2D({x: i, y: i}))
    }
    return objects
})


measureMemory('PerkyModule', () => {
    const objects = []
    for (let i = 0; i < ITERATIONS; i++) {
        objects.push(new PerkyModule({$id: `mod-${i}`}))
    }
    return objects
})


console.log('\n--- Hierarchy building (parent/child) ---')

benchmark('Transform2D hierarchy', () => {
    const root = new Transform2D()
    for (let i = 0; i < ITERATIONS; i++) {
        const child = new Transform2D()
        root.add(child)
    }
    return root
})


benchmark('Group2D hierarchy', () => {
    const root = new Group2D()
    for (let i = 0; i < ITERATIONS; i++) {
        const child = new Sprite2D({x: i, y: i})
        root.add(child)
    }
    return root
})


benchmark('PerkyModule hierarchy (create)', () => {
    const root = new PerkyModule({$id: 'root'})
    for (let i = 0; i < ITERATIONS; i++) {
        root.create(PerkyModule, {$id: `child-${i}`})
    }
    return root
})


console.log('\n--- Matrix updates ---')

benchmark('Transform2D updateWorldMatrix', () => {
    const root = new Transform2D()
    for (let i = 0; i < 100; i++) {
        const child = new Transform2D()
        child.x = i
        child.y = i
        root.add(child)
    }
    
    for (let frame = 0; frame < 100; frame++) {
        root.x = frame
        root.updateWorldMatrix(true)
    }
    return root
})


console.log('\n=== Summary ===')
console.log('PerkyModule adds overhead but provides:')
console.log('- Event system (on/emit/listenTo)')
console.log('- Automatic lifecycle management')
console.log('- Registry with indexing')
console.log('- Tags system')
console.log('- Delegation helpers')
console.log('\nFor render objects with thousands of instances,')
console.log('keeping them lightweight may be preferable.')


test('benchmark runs', () => {
    // This test exists just to run the benchmark
})

