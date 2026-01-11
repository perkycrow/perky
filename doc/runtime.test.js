import {describe, test, expect, vi, beforeEach} from 'vitest'
import {
    doc, section, setup, text, code, action, see, disclaimer, container,
    applyContainerPreset, addSpacerIfNeeded, executeAction, executeContainer, renderAction
} from './runtime.js'
import logger from '../core/logger.js'


vi.mock('../core/logger.js', () => ({
    default: {
        log: vi.fn(),
        error: vi.fn(),
        spacer: vi.fn(),
        history: []
    }
}))


describe('doc', () => {

    test('creates doc with title and blocks', () => {
        const result = doc('My Doc', () => {
            text('Hello')
        })

        expect(result.title).toBe('My Doc')
        expect(result.blocks).toHaveLength(1)
        expect(result.blocks[0].type).toBe('text')
    })


    test('accepts options object', () => {
        const result = doc('My Doc', {foo: 'bar'}, () => {
            text('Hello')
        })

        expect(result.title).toBe('My Doc')
        expect(result.options.foo).toBe('bar')
    })


    test('options defaults to empty object when callback is second arg', () => {
        const result = doc('My Doc', () => {})

        expect(result.options).toEqual({})
    })

})


describe('section', () => {

    test('creates section block', () => {
        const result = doc('Test', () => {
            section('Section 1', () => {
                text('Content')
            })
        })

        expect(result.blocks).toHaveLength(1)
        expect(result.blocks[0].type).toBe('section')
        expect(result.blocks[0].title).toBe('Section 1')
        expect(result.blocks[0].blocks).toHaveLength(1)
    })


    test('throws when called outside doc', () => {
        expect(() => {
            section('Test', () => {})
        }).toThrow('section() must be called inside doc()')
    })


    test('captures setup from within section', () => {
        const setupFn = () => {}

        const result = doc('Test', () => {
            section('With Setup', () => {
                setup(setupFn)
                text('Content')
            })
        })

        expect(result.blocks[0].setup).not.toBeNull()
        expect(result.blocks[0].setup.fn).toBe(setupFn)
    })

})


describe('text', () => {

    test('creates text block', () => {
        const result = doc('Test', () => {
            text('Hello world')
        })

        expect(result.blocks[0].type).toBe('text')
        expect(result.blocks[0].content).toBe('Hello world')
    })


    test('throws when called outside doc', () => {
        expect(() => {
            text('Hello')
        }).toThrow('text() must be called inside doc()')
    })


    test('dedents content', () => {
        const result = doc('Test', () => {
            text(`
                First line
                Second line
            `)
        })

        expect(result.blocks[0].content).toBe('First line\nSecond line')
    })

})


describe('code', () => {

    test('creates code block', () => {
        const result = doc('Test', () => {
            code('Example', () => {
                const x = 1
                return x
            })
        })

        expect(result.blocks[0].type).toBe('code')
        expect(result.blocks[0].title).toBe('Example')
        expect(result.blocks[0].source).toContain('const x = 1')
    })


    test('throws when called outside doc', () => {
        expect(() => {
            code('Test', () => {})
        }).toThrow('code() must be called inside doc()')
    })

})


describe('action', () => {

    test('creates action block with fn', () => {
        const fn = () => console.log('action')

        const result = doc('Test', () => {
            action('Run', fn)
        })

        expect(result.blocks[0].type).toBe('action')
        expect(result.blocks[0].title).toBe('Run')
        expect(result.blocks[0].fn).toBe(fn)
    })


    test('throws when called outside doc', () => {
        expect(() => {
            action('Test', () => {})
        }).toThrow('action() must be called inside doc()')
    })

})


describe('container', () => {

    test('creates container with default height', () => {
        const result = doc('Test', () => {
            container(() => {})
        })

        expect(result.blocks[0].type).toBe('container')
        expect(result.blocks[0].height).toBe(300)
        expect(result.blocks[0].width).toBeNull()
    })


    test('creates container with options', () => {
        const result = doc('Test', () => {
            container({width: 400, height: 500, title: 'Demo'}, () => {})
        })

        expect(result.blocks[0].width).toBe(400)
        expect(result.blocks[0].height).toBe(500)
        expect(result.blocks[0].title).toBe('Demo')
    })


    test('supports preset option', () => {
        const result = doc('Test', () => {
            container({preset: 'interactive'}, () => {})
        })

        expect(result.blocks[0].preset).toBe('interactive')
    })


    test('supports scrollable option', () => {
        const result = doc('Test', () => {
            container({scrollable: true}, () => {})
        })

        expect(result.blocks[0].scrollable).toBe(true)
    })


    test('throws when called outside doc', () => {
        expect(() => {
            container(() => {})
        }).toThrow('container() must be called inside doc()')
    })

})


describe('see', () => {

    test('creates see block with defaults', () => {
        const result = doc('Test', () => {
            see('ActionController')
        })

        expect(result.blocks[0].type).toBe('see')
        expect(result.blocks[0].name).toBe('ActionController')
        expect(result.blocks[0].pageType).toBe('doc')
        expect(result.blocks[0].section).toBeNull()
    })


    test('creates see block with section', () => {
        const result = doc('Test', () => {
            see('ActionController', {section: 'Propagation'})
        })

        expect(result.blocks[0].name).toBe('ActionController')
        expect(result.blocks[0].section).toBe('Propagation')
    })


    test('creates see block with type', () => {
        const result = doc('Test', () => {
            see('ActionController', {type: 'api'})
        })

        expect(result.blocks[0].pageType).toBe('api')
    })


    test('creates see block with type and section', () => {
        const result = doc('Test', () => {
            see('ActionController', {type: 'api', section: 'methods'})
        })

        expect(result.blocks[0].pageType).toBe('api')
        expect(result.blocks[0].section).toBe('methods')
    })


    test('throws when called outside doc', () => {
        expect(() => {
            see('ActionController')
        }).toThrow('see() must be called inside doc()')
    })


    test('creates see block with category', () => {
        const result = doc('Test', () => {
            see('Application', {category: 'application'})
        })

        expect(result.blocks[0].name).toBe('Application')
        expect(result.blocks[0].category).toBe('application')
    })


    test('creates see block with category and type', () => {
        const result = doc('Test', () => {
            see('GameLoop', {category: 'game', type: 'api'})
        })

        expect(result.blocks[0].name).toBe('GameLoop')
        expect(result.blocks[0].category).toBe('game')
        expect(result.blocks[0].pageType).toBe('api')
    })


    test('category defaults to null', () => {
        const result = doc('Test', () => {
            see('PerkyModule')
        })

        expect(result.blocks[0].category).toBeNull()
    })

})


describe('disclaimer', () => {

    test('creates disclaimer block', () => {
        const result = doc('Test', () => {
            disclaimer('This is a disclaimer')
        })

        expect(result.blocks[0].type).toBe('disclaimer')
        expect(result.blocks[0].content).toBe('This is a disclaimer')
    })


    test('dedents content', () => {
        const result = doc('Test', () => {
            disclaimer(`
                First line
                Second line
            `)
        })

        expect(result.blocks[0].content).toBe('First line\nSecond line')
    })


    test('throws when called outside doc', () => {
        expect(() => {
            disclaimer('Test')
        }).toThrow('disclaimer() must be called inside doc()')
    })

})


describe('applyContainerPreset', () => {

    test('applies interactive preset', () => {
        const element = {
            style: {},
            tabIndex: -1
        }

        applyContainerPreset(element, 'interactive')

        expect(element.tabIndex).toBe(0)
        expect(element.style.outline).toBe('none')
        expect(element.style.background).toBe('#1a1a2e')
    })


    test('applies interactive-alt preset', () => {
        const element = {
            style: {},
            tabIndex: -1
        }

        applyContainerPreset(element, 'interactive-alt')

        expect(element.style.background).toBe('#16213e')
    })


    test('applies inspector preset', () => {
        const element = {style: {}}

        applyContainerPreset(element, 'inspector')

        expect(element.style.padding).toBe('12px')
        expect(element.style.overflow).toBe('auto')
    })


    test('applies centered preset', () => {
        const element = {style: {}}

        applyContainerPreset(element, 'centered')

        expect(element.style.display).toBe('flex')
        expect(element.style.alignItems).toBe('center')
        expect(element.style.justifyContent).toBe('center')
    })


    test('ignores unknown preset', () => {
        const element = {style: {}}

        applyContainerPreset(element, 'unknown')

        expect(Object.keys(element.style)).toHaveLength(0)
    })

})


describe('addSpacerIfNeeded', () => {

    beforeEach(() => {
        logger.history.length = 0
        vi.clearAllMocks()
    })


    test('adds spacer when history has logs and no trailing spacer', () => {
        logger.history.push({event: 'log'})

        addSpacerIfNeeded()

        expect(logger.spacer).toHaveBeenCalled()
    })


    test('does not add spacer when history is empty', () => {
        addSpacerIfNeeded()

        expect(logger.spacer).not.toHaveBeenCalled()
    })


    test('does not add spacer when last entry is already spacer', () => {
        logger.history.push({event: 'log'}, {event: 'spacer'})

        addSpacerIfNeeded()

        expect(logger.spacer).not.toHaveBeenCalled()
    })

})


describe('executeAction', () => {

    beforeEach(() => {
        logger.history.length = 0
        vi.clearAllMocks()
    })


    test('executes block function', async () => {
        const fn = vi.fn()
        const block = {fn}

        await executeAction(block)

        expect(fn).toHaveBeenCalledWith({})
    })


    test('executes setup function before block', async () => {
        const order = []
        const setupFn = vi.fn(() => order.push('setup'))
        const blockFn = vi.fn(() => order.push('block'))
        const block = {fn: blockFn}
        const sectionSetup = {fn: setupFn}

        await executeAction(block, sectionSetup)

        expect(order).toEqual(['setup', 'block'])
    })


    test('logs error on failure', async () => {
        const block = {fn: () => {
            throw new Error('Test error')
        }}

        await executeAction(block)

        expect(logger.error).toHaveBeenCalledWith('Action error:', 'Test error')
    })

})


describe('executeContainer', () => {

    beforeEach(() => {
        logger.history.length = 0
        vi.clearAllMocks()
    })


    test('clears container before execution', async () => {
        const containerEl = {
            innerHTML: '<div>old</div>',
            _currentApp: null,
            style: {},
            tabIndex: -1
        }
        const block = {fn: vi.fn()}

        await executeContainer(block, containerEl)

        expect(containerEl.innerHTML).toBe('')
    })


    test('disposes previous app', async () => {
        const dispose = vi.fn()
        const containerEl = {
            innerHTML: '',
            _currentApp: {dispose},
            style: {},
            tabIndex: -1
        }
        const block = {fn: vi.fn()}

        await executeContainer(block, containerEl)

        expect(dispose).toHaveBeenCalled()
    })


    test('applies preset when specified', async () => {
        const containerEl = {
            innerHTML: '',
            _currentApp: null,
            style: {},
            tabIndex: -1
        }
        const block = {preset: 'interactive', fn: vi.fn()}

        await executeContainer(block, containerEl)

        expect(containerEl.tabIndex).toBe(0)
    })


    test('sets overflow when scrollable', async () => {
        const containerEl = {
            innerHTML: '',
            _currentApp: null,
            style: {},
            tabIndex: -1
        }
        const block = {scrollable: true, fn: vi.fn()}

        await executeContainer(block, containerEl)

        expect(containerEl.style.overflow).toBe('auto')
    })


    test('logs error on failure', async () => {
        const containerEl = {
            innerHTML: '',
            _currentApp: null,
            style: {},
            tabIndex: -1
        }
        const block = {fn: () => {
            throw new Error('Container error')
        }}

        await executeContainer(block, containerEl)

        expect(logger.error).toHaveBeenCalledWith('Container error:', 'Container error')
    })

})


describe('renderAction', () => {

    test('creates action block wrapper', () => {
        const block = {title: 'Run Test', source: 'console.log("test")'}

        const el = renderAction(block)

        expect(el.className).toBe('doc-action-block')
    })


    test('creates perky-code element with title', () => {
        const block = {title: 'Example', source: 'const x = 1'}

        const el = renderAction(block)
        const codeEl = el.querySelector('perky-code')

        expect(codeEl.getAttribute('title')).toBe('Example')
    })


    test('uses extracted source when provided', () => {
        const block = {title: 'Test', source: 'original'}

        const el = renderAction(block, null, 'extracted')
        const codeEl = el.querySelector('perky-code')

        expect(codeEl.code).toBe('extracted')
    })


    test('creates run button', () => {
        const block = {title: 'Test', source: ''}

        const el = renderAction(block)
        const button = el.querySelector('.doc-action-btn')

        expect(button).toBeTruthy()
        expect(button.textContent).toContain('Run')
    })

})
