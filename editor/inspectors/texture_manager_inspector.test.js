import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import TextureManagerInspector from './texture_manager_inspector.js'
import Notifier from '../../core/notifier.js'


class MockTextureManager extends Notifier {

    #stats

    constructor (options = {}) {
        super()
        this.maxZombieSize = options.maxZombieSize ?? 1024 * 1024
        this.autoFlushEnabled = options.autoFlushEnabled ?? true
        this.#stats = options.stats || {
            activeCount: 0,
            activeSize: 0,
            zombieCount: 0,
            zombieSize: 0,
            totalSize: 0
        }
    }


    get stats () {
        return this.#stats
    }


    updateStats (updates) {
        Object.assign(this.#stats, updates)
    }


    flush () {  
        return {count: 5, size: 1000}
    }


    flushStale () {  
        return {count: 2, size: 500}
    }

}


describe('TextureManagerInspector', () => {

    let inspector
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        inspector = document.createElement('texture-manager-inspector')
        container.appendChild(inspector)
    })


    afterEach(() => {
        container.remove()
    })


    describe('initialization', () => {

        test('extends HTMLElement', () => {
            expect(inspector).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(inspector.shadowRoot).not.toBeNull()
        })


        test('has stat cards', () => {
            const cards = inspector.shadowRoot.querySelectorAll('.stat-card')
            expect(cards.length).toBe(2)
        })


        test('has progress section', () => {
            const progress = inspector.shadowRoot.querySelector('.progress-section')
            expect(progress).not.toBeNull()
        })


        test('has flush buttons', () => {
            const buttons = inspector.actionsEl.querySelectorAll('button')
            expect(buttons.length).toBe(2)
        })

    })


    test('matches static matches method exists', () => {
        expect(typeof TextureManagerInspector.matches).toBe('function')
    })


    describe('setModule', () => {

        test('stores the module', () => {
            const module = new MockTextureManager()
            inspector.setModule(module)
            expect(inspector.getModule()).toBe(module)
        })


        test('displays stats when module is set', () => {
            const module = new MockTextureManager({
                stats: {
                    activeCount: 10,
                    activeSize: 1024,
                    zombieCount: 5,
                    zombieSize: 512,
                    totalSize: 1536
                }
            })
            inspector.setModule(module)

            const values = inspector.shadowRoot.querySelectorAll('.stat-value')
            const hasActive = Array.from(values).some(v => v.textContent === '10')
            expect(hasActive).toBe(true)
        })

    })


    describe('stat cards', () => {

        test('shows active texture count', () => {
            const module = new MockTextureManager({
                stats: {activeCount: 15, activeSize: 0, zombieCount: 0, zombieSize: 0, totalSize: 0}
            })
            inspector.setModule(module)

            const activeCard = inspector.shadowRoot.querySelector('.stat-value.active')
            expect(activeCard.textContent).toBe('15')
        })


        test('shows zombie texture count', () => {
            const module = new MockTextureManager({
                stats: {activeCount: 0, activeSize: 0, zombieCount: 8, zombieSize: 0, totalSize: 0}
            })
            inspector.setModule(module)

            const zombieCard = inspector.shadowRoot.querySelector('.stat-value.zombie')
            expect(zombieCard.textContent).toBe('8')
        })

    })


    describe('progress bar', () => {

        test('shows usage percentage', () => {
            const module = new MockTextureManager({
                maxZombieSize: 1000,
                stats: {activeCount: 0, activeSize: 0, zombieCount: 0, zombieSize: 500, totalSize: 500}
            })
            inspector.setModule(module)

            const value = inspector.shadowRoot.querySelector('.progress-value')
            expect(value.textContent).toBe('50.0%')
        })


        test('has low class when usage under 40%', () => {
            const module = new MockTextureManager({
                maxZombieSize: 1000,
                stats: {activeCount: 0, activeSize: 0, zombieCount: 0, zombieSize: 300, totalSize: 300}
            })
            inspector.setModule(module)

            const bar = inspector.shadowRoot.querySelector('.progress-bar')
            expect(bar.classList.contains('low')).toBe(true)
        })


        test('has medium class when usage 40-75%', () => {
            const module = new MockTextureManager({
                maxZombieSize: 1000,
                stats: {activeCount: 0, activeSize: 0, zombieCount: 0, zombieSize: 500, totalSize: 500}
            })
            inspector.setModule(module)

            const bar = inspector.shadowRoot.querySelector('.progress-bar')
            expect(bar.classList.contains('medium')).toBe(true)
        })


        test('has high class when usage over 75%', () => {
            const module = new MockTextureManager({
                maxZombieSize: 1000,
                stats: {activeCount: 0, activeSize: 0, zombieCount: 0, zombieSize: 800, totalSize: 800}
            })
            inspector.setModule(module)

            const bar = inspector.shadowRoot.querySelector('.progress-bar')
            expect(bar.classList.contains('high')).toBe(true)
        })

    })


    describe('info rows', () => {

        test('shows auto flush status enabled', () => {
            const module = new MockTextureManager({autoFlushEnabled: true})
            inspector.setModule(module)

            const values = inspector.shadowRoot.querySelectorAll('.info-value')
            const hasEnabled = Array.from(values).some(v => v.textContent === 'Enabled')
            expect(hasEnabled).toBe(true)
        })


        test('shows auto flush status disabled', () => {
            const module = new MockTextureManager({autoFlushEnabled: false})
            inspector.setModule(module)

            const values = inspector.shadowRoot.querySelectorAll('.info-value')
            const hasDisabled = Array.from(values).some(v => v.textContent === 'Disabled')
            expect(hasDisabled).toBe(true)
        })

    })


    describe('flush buttons', () => {

        test('calls flush when Flush All clicked', () => {
            const module = new MockTextureManager()
            module.flush = vi.fn().mockReturnValue({count: 0, size: 0})
            inspector.setModule(module)

            const buttons = inspector.actionsEl.querySelectorAll('button')
            const flushBtn = Array.from(buttons).find(b => b.textContent.includes('Flush All'))
            flushBtn.click()

            expect(module.flush).toHaveBeenCalled()
        })


        test('calls flushStale when Flush Stale clicked', () => {
            const module = new MockTextureManager()
            module.flushStale = vi.fn().mockReturnValue({count: 0, size: 0})
            inspector.setModule(module)

            const buttons = inspector.actionsEl.querySelectorAll('button')
            const flushStaleBtn = Array.from(buttons).find(b => b.textContent.includes('Flush Stale'))
            flushStaleBtn.click()

            expect(module.flushStale).toHaveBeenCalled()
        })

    })


    describe('event binding', () => {

        test('updates on create event', () => {
            const module = new MockTextureManager({
                stats: {activeCount: 0, activeSize: 0, zombieCount: 0, zombieSize: 0, totalSize: 0}
            })
            inspector.setModule(module)

            module.updateStats({activeCount: 5})
            module.emit('create')

            const activeCard = inspector.shadowRoot.querySelector('.stat-value.active')
            expect(activeCard.textContent).toBe('5')
        })


        test('updates on zombie event', () => {
            const module = new MockTextureManager({
                stats: {activeCount: 0, activeSize: 0, zombieCount: 0, zombieSize: 0, totalSize: 0}
            })
            inspector.setModule(module)

            module.updateStats({zombieCount: 3})
            module.emit('zombie')

            const zombieCard = inspector.shadowRoot.querySelector('.stat-value.zombie')
            expect(zombieCard.textContent).toBe('3')
        })


        test('cleans listeners when module changes', () => {
            const module1 = new MockTextureManager({
                stats: {activeCount: 10, activeSize: 0, zombieCount: 0, zombieSize: 0, totalSize: 0}
            })
            inspector.setModule(module1)

            const module2 = new MockTextureManager({
                stats: {activeCount: 0, activeSize: 0, zombieCount: 0, zombieSize: 0, totalSize: 0}
            })
            inspector.setModule(module2)

            module1.updateStats({activeCount: 99})
            module1.emit('create')

            const activeCard = inspector.shadowRoot.querySelector('.stat-value.active')
            expect(activeCard.textContent).toBe('0')
        })

    })

})
