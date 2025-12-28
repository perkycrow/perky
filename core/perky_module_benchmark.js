import Notifier from './notifier.js'
import Registry from './registry.js'
import ObservableSet from './observable_set.js'
import PerkyModule from './perky_module.js'
import PerkyModuleMonolithic from './perky_module_monolithic.js'


const ITERATIONS = 10000
const WARMUP_ITERATIONS = 1000


function benchmark (name, fn) {
    for (let i = 0; i < WARMUP_ITERATIONS; i++) {
        fn()
    }

    const start = performance.now()
    for (let i = 0; i < ITERATIONS; i++) {
        fn()
    }
    const end = performance.now()

    const totalMs = end - start
    const avgUs = (totalMs / ITERATIONS) * 1000

    console.log(`${name}: ${totalMs.toFixed(2)}ms total, ${avgUs.toFixed(3)}µs/op`)
    return totalMs
}


function runBenchmarks () {
    console.log(`\n=== PerkyModule Benchmark (${ITERATIONS} iterations) ===\n`)

    console.log('--- Instance creation (reference) ---')
    benchmark('new Object()', () => {
        for (let i = 0; i < 100; i++) {
            new Object() // eslint-disable-line no-new
        }
    })

    benchmark('new Notifier()', () => {
        for (let i = 0; i < 100; i++) {
            new Notifier()
        }
    })

    benchmark('new ObservableSet()', () => {
        for (let i = 0; i < 100; i++) {
            new ObservableSet()
        }
    })

    benchmark('new Registry()', () => {
        for (let i = 0; i < 100; i++) {
            new Registry()
        }
    })

    benchmark('new Registry() + addIndex', () => {
        for (let i = 0; i < 100; i++) {
            const r = new Registry()
            r.addIndex('$category')
        }
    })

    benchmark('new PerkyModule()', () => {
        for (let i = 0; i < 100; i++) {
            new PerkyModule()
        }
    })

    benchmark('new PerkyModuleMonolithic()', () => {
        for (let i = 0; i < 100; i++) {
            new PerkyModuleMonolithic()
        }
    })


    console.log('--- Create children ---')
    const refactoredCreate = benchmark('Refactored', () => {
        const parent = new PerkyModule()
        for (let i = 0; i < 10; i++) {
            parent.create(PerkyModule)
        }
        parent.dispose()
    })

    const monolithicCreate = benchmark('Monolithic', () => {
        const parent = new PerkyModuleMonolithic()
        for (let i = 0; i < 10; i++) {
            parent.create(PerkyModuleMonolithic)
        }
        parent.dispose()
    })

    printDiff(refactoredCreate, monolithicCreate)

    console.log('\n--- Dispose cascade (100 children) ---')
    const refactoredDispose = benchmark('Refactored', () => {
        const parent = new PerkyModule()
        for (let i = 0; i < 100; i++) {
            parent.create(PerkyModule)
        }
        parent.dispose()
    })

    const monolithicDispose = benchmark('Monolithic', () => {
        const parent = new PerkyModuleMonolithic()
        for (let i = 0; i < 100; i++) {
            parent.create(PerkyModuleMonolithic)
        }
        parent.dispose()
    })

    printDiff(refactoredDispose, monolithicDispose)

    console.log('\n--- childrenByTags with index ---')
    const refactoredTags = benchmark('Refactored', () => {
        const parent = new PerkyModule()
        parent.addTagsIndex(['enemy', 'collidable'])

        for (let i = 0; i < 50; i++) {
            parent.create(PerkyModule, {$tags: ['enemy', 'collidable']})
            parent.create(PerkyModule, {$tags: ['friendly']})
        }

        for (let i = 0; i < 10; i++) {
            parent.childrenByTags(['enemy', 'collidable'])
        }

        parent.dispose()
    })

    const monolithicTags = benchmark('Monolithic', () => {
        const parent = new PerkyModuleMonolithic()
        parent.addTagsIndex(['enemy', 'collidable'])

        for (let i = 0; i < 50; i++) {
            parent.create(PerkyModuleMonolithic, {$tags: ['enemy', 'collidable']})
            parent.create(PerkyModuleMonolithic, {$tags: ['friendly']})
        }

        for (let i = 0; i < 10; i++) {
            parent.childrenByTags(['enemy', 'collidable'])
        }

        parent.dispose()
    })

    printDiff(refactoredTags, monolithicTags)

    console.log('\n--- Delegation ---')
    const refactoredDelegation = benchmark('Refactored', () => {
        const host = new PerkyModule()
        const child = host.create(PerkyModule)
        child.testMethod = () => 42
        child.testProp = 'value'
        child.delegateTo(host, ['testMethod', 'testProp'])
        host.dispose()
    })

    const monolithicDelegation = benchmark('Monolithic', () => {
        const host = new PerkyModuleMonolithic()
        const child = host.create(PerkyModuleMonolithic)
        child.testMethod = () => 42
        child.testProp = 'value'
        child.delegateTo(host, ['testMethod', 'testProp'])
        host.dispose()
    })

    printDiff(refactoredDelegation, monolithicDelegation)

    console.log('\n--- hasChild / getChild (prototype methods) ---')
    const refactoredLookup = benchmark('Refactored', () => {
        const parent = new PerkyModule()
        for (let i = 0; i < 10; i++) {
            parent.create(PerkyModule, {$id: `child_${i}`})
        }
        for (let i = 0; i < 100; i++) {
            parent.hasChild('child_5')
            parent.getChild('child_5')
        }
        parent.dispose()
    })

    const monolithicLookup = benchmark('Monolithic', () => {
        const parent = new PerkyModuleMonolithic()
        for (let i = 0; i < 10; i++) {
            parent.create(PerkyModuleMonolithic, {$id: `child_${i}`})
        }
        for (let i = 0; i < 100; i++) {
            parent.hasChild('child_5')
            parent.getChild('child_5')
        }
        parent.dispose()
    })

    printDiff(refactoredLookup, monolithicLookup)

    console.log('\n=== Summary ===\n')
}


function printDiff (refactored, monolithic) {
    const diff = ((refactored - monolithic) / monolithic) * 100
    const sign = diff > 0 ? '+' : ''
    const status = Math.abs(diff) < 5 ? '~' : (diff > 0 ? 'slower' : 'faster')
    console.log(`  → Difference: ${sign}${diff.toFixed(2)}% (${status})`)
}


runBenchmarks()

