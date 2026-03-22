import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import './apps_tool.js'


describe('AppsTool', () => {

    let tool
    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)

        tool = document.createElement('apps-tool')
        container.appendChild(tool)
    })


    afterEach(() => {
        container.remove()
    })


    describe('static properties', () => {

        test('toolId', () => {
            expect(tool.constructor.toolId).toBe('apps')
        })


        test('toolName', () => {
            expect(tool.constructor.toolName).toBe('Applications')
        })


        test('toolIcon', () => {
            expect(tool.constructor.toolIcon).toBeDefined()
            expect(tool.constructor.toolIcon).toContain('<svg')
        })


        test('location', () => {
            expect(tool.constructor.location).toBe('sidebar')
        })


        test('order', () => {
            expect(tool.constructor.order).toBe(20)
        })

    })


    describe('initialization', () => {

        test('extends HTMLElement', () => {
            expect(tool).toBeInstanceOf(HTMLElement)
        })


        test('has shadow DOM', () => {
            expect(tool.shadowRoot).not.toBeNull()
        })


        test('creates container element', () => {
            const containerEl = tool.shadowRoot.querySelector('.apps-container')
            expect(containerEl).not.toBeNull()
        })


        test('creates registered apps section', () => {
            const section = tool.shadowRoot.querySelector('.apps-list[data-type="registered"]')
            expect(section).not.toBeNull()
        })


        test('creates running apps section', () => {
            const section = tool.shadowRoot.querySelector('.apps-list[data-type="running"]')
            expect(section).not.toBeNull()
        })

    })


    test('onStateSet registers appmanager:change listener', () => {
        const state = {
            appManager: null,
            addEventListener: vi.fn()
        }

        tool.setState(state)

        expect(state.addEventListener).toHaveBeenCalledWith('appmanager:change', expect.any(Function))
    })


    describe('without appManager', () => {

        test('shows no AppManager message in registered list', () => {
            const state = {
                appManager: null,
                addEventListener: vi.fn()
            }
            tool.setState(state)

            const registeredList = tool.shadowRoot.querySelector('.apps-list[data-type="registered"]')
            expect(registeredList.innerHTML).toContain('No AppManager connected')
        })


        test('shows no AppManager message in running list', () => {
            const state = {
                appManager: null,
                addEventListener: vi.fn()
            }
            tool.setState(state)

            const runningList = tool.shadowRoot.querySelector('.apps-list[data-type="running"]')
            expect(runningList.innerHTML).toContain('No AppManager connected')
        })

    })


    describe('with appManager', () => {

        test('shows no apps registered when empty', () => {
            const state = {
                appManager: {
                    constructors: {keys: []},
                    list: () => []
                },
                addEventListener: vi.fn()
            }
            tool.setState(state)

            const registeredList = tool.shadowRoot.querySelector('.apps-list[data-type="registered"]')
            expect(registeredList.innerHTML).toContain('No apps registered')
        })


        test('shows no apps running when empty', () => {
            const state = {
                appManager: {
                    constructors: {keys: []},
                    list: () => []
                },
                addEventListener: vi.fn()
            }
            tool.setState(state)

            const runningList = tool.shadowRoot.querySelector('.apps-list[data-type="running"]')
            expect(runningList.innerHTML).toContain('No apps running')
        })


        test('displays registered app names', () => {
            const state = {
                appManager: {
                    constructors: {keys: ['GameApp', 'MenuApp']},
                    list: () => []
                },
                addEventListener: vi.fn()
            }
            tool.setState(state)

            const registeredList = tool.shadowRoot.querySelector('.apps-list[data-type="registered"]')
            const items = registeredList.querySelectorAll('.apps-item')

            expect(items.length).toBe(2)
            expect(items[0].textContent).toContain('GameApp')
            expect(items[1].textContent).toContain('MenuApp')
        })


        test('displays running apps with status', () => {
            const state = {
                appManager: {
                    constructors: {keys: []},
                    list: () => [
                        {$id: 'game1', $status: 'started', constructor: {name: 'GameApp'}}
                    ]
                },
                addEventListener: vi.fn()
            }
            tool.setState(state)

            const runningList = tool.shadowRoot.querySelector('.apps-list[data-type="running"]')
            const items = runningList.querySelectorAll('.apps-item')

            expect(items.length).toBe(1)
            expect(items[0].textContent).toContain('game1')
            expect(items[0].textContent).toContain('GameApp')
        })


        test('shows started status class', () => {
            const state = {
                appManager: {
                    constructors: {keys: []},
                    list: () => [
                        {$id: 'game1', $status: 'started', constructor: {name: 'GameApp'}}
                    ]
                },
                addEventListener: vi.fn()
            }
            tool.setState(state)

            const statusEl = tool.shadowRoot.querySelector('.apps-item-status')
            expect(statusEl.classList.contains('started')).toBe(true)
        })


        test('shows stopped status class', () => {
            const state = {
                appManager: {
                    constructors: {keys: []},
                    list: () => [
                        {$id: 'game1', $status: 'stopped', constructor: {name: 'GameApp'}}
                    ]
                },
                addEventListener: vi.fn()
            }
            tool.setState(state)

            const statusEl = tool.shadowRoot.querySelector('.apps-item-status')
            expect(statusEl.classList.contains('stopped')).toBe(true)
        })


        test('shows disposed status class', () => {
            const state = {
                appManager: {
                    constructors: {keys: []},
                    list: () => [
                        {$id: 'game1', $status: 'disposed', constructor: {name: 'GameApp'}}
                    ]
                },
                addEventListener: vi.fn()
            }
            tool.setState(state)

            const statusEl = tool.shadowRoot.querySelector('.apps-item-status')
            expect(statusEl.classList.contains('disposed')).toBe(true)
        })


        test('shows Stop button for started app', () => {
            const state = {
                appManager: {
                    constructors: {keys: []},
                    list: () => [
                        {$id: 'game1', $status: 'started', constructor: {name: 'GameApp'}}
                    ]
                },
                addEventListener: vi.fn()
            }
            tool.setState(state)

            const actions = tool.shadowRoot.querySelector('.apps-item-actions')
            const buttons = actions.querySelectorAll('button')
            const buttonTexts = Array.from(buttons).map(b => b.textContent)

            expect(buttonTexts).toContain('Stop')
            expect(buttonTexts).toContain('Dispose')
        })


        test('shows Start button for stopped app', () => {
            const state = {
                appManager: {
                    constructors: {keys: []},
                    list: () => [
                        {$id: 'game1', $status: 'stopped', constructor: {name: 'GameApp'}}
                    ]
                },
                addEventListener: vi.fn()
            }
            tool.setState(state)

            const actions = tool.shadowRoot.querySelector('.apps-item-actions')
            const buttons = actions.querySelectorAll('button')
            const buttonTexts = Array.from(buttons).map(b => b.textContent)

            expect(buttonTexts).toContain('Start')
            expect(buttonTexts).toContain('Dispose')
        })


        test('Stop button calls stopApp', () => {
            const stopApp = vi.fn()
            const state = {
                appManager: {
                    constructors: {keys: []},
                    list: () => [
                        {$id: 'game1', $status: 'started', constructor: {name: 'GameApp'}}
                    ],
                    stopApp
                },
                addEventListener: vi.fn()
            }
            tool.setState(state)

            const stopBtn = Array.from(tool.shadowRoot.querySelectorAll('button')).find(b => b.textContent === 'Stop')
            stopBtn.click()

            expect(stopApp).toHaveBeenCalledWith('game1')
        })


        test('Start button calls startApp', () => {
            const startApp = vi.fn()
            const state = {
                appManager: {
                    constructors: {keys: []},
                    list: () => [
                        {$id: 'game1', $status: 'stopped', constructor: {name: 'GameApp'}}
                    ],
                    startApp
                },
                addEventListener: vi.fn()
            }
            tool.setState(state)

            const startBtn = Array.from(tool.shadowRoot.querySelectorAll('button')).find(b => b.textContent === 'Start')
            startBtn.click()

            expect(startApp).toHaveBeenCalledWith('game1')
        })


        test('Dispose button calls disposeApp', () => {
            const disposeApp = vi.fn()
            const state = {
                appManager: {
                    constructors: {keys: []},
                    list: () => [
                        {$id: 'game1', $status: 'started', constructor: {name: 'GameApp'}}
                    ],
                    disposeApp
                },
                addEventListener: vi.fn()
            }
            tool.setState(state)

            const disposeBtn = Array.from(tool.shadowRoot.querySelectorAll('button')).find(b => b.textContent === 'Dispose')
            disposeBtn.click()

            expect(disposeApp).toHaveBeenCalledWith('game1')
        })

    })


    test('appmanager:change event updates appManager', () => {
        let changeHandler
        const state = {
            appManager: null,
            addEventListener: vi.fn((event, handler) => {
                if (event === 'appmanager:change') {
                    changeHandler = handler
                }
            })
        }
        tool.setState(state)

        const newAppManager = {
            constructors: {keys: ['NewApp']},
            list: () => []
        }
        changeHandler({detail: {appManager: newAppManager}})

        const registeredList = tool.shadowRoot.querySelector('.apps-list[data-type="registered"]')
        expect(registeredList.textContent).toContain('NewApp')
    })


    test('onActivate refreshes the tool', () => {
        const state = {
            appManager: {
                constructors: {keys: []},
                list: () => []
            },
            addEventListener: vi.fn()
        }
        tool.setState(state)

        expect(() => tool.onActivate()).not.toThrow()
    })

})
