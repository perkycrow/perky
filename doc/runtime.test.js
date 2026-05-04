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


describe('setup', () => {

    test('throws when called outside doc', () => {
        expect(() => {
            setup(() => {})
        }).toThrow('setup() must be called inside doc() or section()')
    })


    test('captures source from function', () => {
        const result = doc('Test', () => {
            section('With Setup', () => {
                setup(() => {
                    const x = 1
                    return x
                })
            })
        })

        expect(result.blocks[0].setup.source).toContain('const x = 1')
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


    test('executes sectionSetup before block', async () => {
        const order = []
        const containerEl = createMockContainer()
        const sectionSetup = {fn: vi.fn(() => order.push('setup'))}
        const block = {fn: vi.fn(() => order.push('block'))}

        await executeContainer(block, containerEl, sectionSetup)

        expect(order).toEqual(['setup', 'block'])
    })


    test('focuses container when tabIndex >= 0', async () => {
        const containerEl = createMockContainer()
        containerEl.tabIndex = 0
        containerEl.focus = vi.fn()
        const block = {fn: vi.fn()}

        await executeContainer(block, containerEl)

        expect(containerEl.focus).toHaveBeenCalled()
    })


    test('does not focus container when tabIndex < 0', async () => {
        const containerEl = createMockContainer()
        containerEl.tabIndex = -1
        containerEl.focus = vi.fn()
        const block = {fn: vi.fn()}

        await executeContainer(block, containerEl)

        expect(containerEl.focus).not.toHaveBeenCalled()
    })


    test('ctx.setApp stores app on container', async () => {
        const containerEl = createMockContainer()
        const app = {id: 'test-app'}
        const block = {fn: (ctx) => ctx.setApp(app)}

        await executeContainer(block, containerEl)

        expect(containerEl._currentApp).toBe(app)
    })


    test('ctx.hint creates hint element', async () => {
        const containerEl = createMockContainer()
        const block = {fn: (ctx) => ctx.hint('Press any key')}

        await executeContainer(block, containerEl)

        const hint = containerEl.querySelector('.doc-hint')
        expect(hint.textContent).toBe('Press any key')
    })


    test('ctx.box creates positioned box element', async () => {
        const containerEl = createMockContainer()
        const block = {fn: (ctx) => ctx.box({size: 50, color: 'red'})}

        await executeContainer(block, containerEl)

        const box = containerEl.children[0]
        expect(box.style.width).toBe('50px')
        expect(box.style.height).toBe('50px')
        expect(box.style.background).toBe('red')
    })


    test('ctx.marker creates positioned marker element', async () => {
        const containerEl = createMockContainer()
        const block = {fn: (ctx) => ctx.marker(100, 200, {size: 30, color: 'blue'})}

        await executeContainer(block, containerEl)

        const marker = containerEl.children[0]
        expect(marker.style.left).toBe('100px')
        expect(marker.style.top).toBe('200px')
        expect(marker.style.width).toBe('30px')
        expect(marker.style.background).toBe('blue')
    })


    test('ctx.column creates flex column', async () => {
        const containerEl = createMockContainer()
        const block = {fn: (ctx) => ctx.column({gap: 10})}

        await executeContainer(block, containerEl)

        const column = containerEl.children[0]
        expect(column.style.display).toBe('flex')
        expect(column.style.flexDirection).toBe('column')
        expect(column.style.gap).toBe('10px')
    })


    test('ctx.row creates flex row', async () => {
        const containerEl = createMockContainer()
        const block = {fn: (ctx) => ctx.row({gap: 16})}

        await executeContainer(block, containerEl)

        const row = containerEl.children[0]
        expect(row.style.display).toBe('flex')
        expect(row.style.flexDirection).toBe('row')
        expect(row.style.gap).toBe('16px')
    })


    test('ctx.label creates label element', async () => {
        const containerEl = createMockContainer()
        const block = {fn: (ctx) => ctx.label('Status')}

        await executeContainer(block, containerEl)

        const label = containerEl.children[0]
        expect(label.textContent).toBe('Status')
    })


    test('ctx.checkerBoard creates checkered background', async () => {
        const containerEl = createMockContainer()
        const block = {fn: (ctx) => ctx.checkerBoard({width: 100, height: 100})}

        await executeContainer(block, containerEl)

        const board = containerEl.children[0]
        expect(board.style.cssText).toContain('width: 100px')
        expect(board.style.cssText).toContain('height: 100px')
        expect(board.style.cssText).toContain('border')
        expect(board.style.cssText).toContain('overflow: hidden')
    })


    test('ctx.info creates updatable info element', async () => {
        const containerEl = createMockContainer()
        let updateFn
        const block = {
            fn: (ctx) => {
                updateFn = ctx.info((val) => `Count: ${val || 0}`)
            }
        }

        await executeContainer(block, containerEl)

        const infoBar = containerEl.querySelector('.doc-info-bar')
        const info = infoBar.querySelector('.doc-info')
        expect(info.textContent).toBe('Count: 0')

        updateFn(5)
        expect(info.textContent).toBe('Count: 5')
    })


    test('ctx.display creates updatable display element', async () => {
        const containerEl = createMockContainer()
        let updateFn
        const block = {
            fn: (ctx) => {
                updateFn = ctx.display((val) => `Value: ${val || 'none'}`)
            }
        }

        await executeContainer(block, containerEl)

        const display = containerEl.querySelector('.doc-display')
        expect(display.innerHTML).toBe('Value: none')

        updateFn('test')
        expect(display.innerHTML).toBe('Value: test')
    })


    test('ctx.display handles array result', async () => {
        const containerEl = createMockContainer()
        let updateFn
        const block = {
            fn: (ctx) => {
                updateFn = ctx.display(() => ['a', 'b', 'c'])
            }
        }

        await executeContainer(block, containerEl)

        const display = containerEl.querySelector('.doc-display')
        expect(display.querySelectorAll('.doc-display-tag').length).toBe(3)
    })


    test('ctx.display handles HTMLElement result', async () => {
        const containerEl = createMockContainer()
        let updateFn
        const block = {
            fn: (ctx) => {
                updateFn = ctx.display(() => {
                    const el = document.createElement('span')
                    el.textContent = 'custom'
                    return el
                })
            }
        }

        await executeContainer(block, containerEl)

        const display = containerEl.querySelector('.doc-display')
        expect(display.querySelector('span').textContent).toBe('custom')
    })


    test('ctx.action creates action bar with buttons', async () => {
        const containerEl = createMockContainer()
        const callback1 = vi.fn()
        const callback2 = vi.fn()
        const block = {
            fn: (ctx) => {
                ctx.action('Action 1', callback1)
                ctx.action('Action 2', callback2)
            }
        }

        await executeContainer(block, containerEl)

        const actionsBar = containerEl.querySelector('.doc-actions-bar')
        expect(actionsBar).toBeTruthy()

        const buttons = actionsBar.querySelectorAll('.doc-actions-btn')
        expect(buttons.length).toBe(2)
        expect(buttons[0].textContent).toBe('Action 1')
        expect(buttons[0].classList.contains('doc-actions-btn--active')).toBe(true)
        expect(callback1).toHaveBeenCalled()
        expect(callback2).not.toHaveBeenCalled()
    })


    test('ctx.action clicking button activates it', async () => {
        const containerEl = createMockContainer()
        const callback1 = vi.fn()
        const callback2 = vi.fn()
        const block = {
            fn: (ctx) => {
                ctx.action('Action 1', callback1)
                ctx.action('Action 2', callback2)
            }
        }

        await executeContainer(block, containerEl)

        const buttons = containerEl.querySelectorAll('.doc-actions-btn')
        buttons[1].click()

        expect(buttons[0].classList.contains('doc-actions-btn--active')).toBe(false)
        expect(buttons[1].classList.contains('doc-actions-btn--active')).toBe(true)
        expect(callback2).toHaveBeenCalled()
    })


    test('ctx.slider creates slider with controls', async () => {
        const containerEl = createMockContainer()
        const onChange = vi.fn()
        let sliderHandle
        const block = {
            fn: (ctx) => {
                sliderHandle = ctx.slider('Speed', {min: 0, max: 100, default: 50}, onChange)
            }
        }

        await executeContainer(block, containerEl)

        const slidersBar = containerEl.querySelector('.doc-sliders-bar')
        expect(slidersBar).toBeTruthy()

        const label = slidersBar.querySelector('.doc-slider-label')
        expect(label.textContent).toBe('Speed')

        const value = slidersBar.querySelector('.doc-slider-value')
        expect(value.textContent).toBe('50')

        const input = slidersBar.querySelector('.doc-slider')
        expect(input.min).toBe('0')
        expect(input.max).toBe('100')
        expect(input.value).toBe('50')

        expect(onChange).toHaveBeenCalledWith(50)

        expect(sliderHandle.get()).toBe(50)
        sliderHandle.set(75)
        expect(sliderHandle.get()).toBe(75)
    })


    test('ctx.slider updates on input', async () => {
        const containerEl = createMockContainer()
        const onChange = vi.fn()
        const block = {
            fn: (ctx) => {
                ctx.slider('Value', {min: 0, max: 10, default: 5}, onChange)
            }
        }

        await executeContainer(block, containerEl)

        const input = containerEl.querySelector('.doc-slider')
        input.value = '8'
        input.dispatchEvent(new Event('input'))

        expect(onChange).toHaveBeenLastCalledWith(8)
    })


    test('ctx.canvas creates canvas wrapper with update function', async () => {
        const containerEl = createMockContainer()
        const sourceCanvas = document.createElement('canvas')
        sourceCanvas.width = 100
        sourceCanvas.height = 50
        let canvasHandle
        const block = {
            fn: (ctx) => {
                canvasHandle = ctx.canvas(sourceCanvas, {maxWidth: 200})
            }
        }

        await executeContainer(block, containerEl)

        expect(canvasHandle.element).toBeTruthy()
        expect(canvasHandle.canvas).toBeTruthy()
        expect(canvasHandle.canvas.width).toBe(100)
        expect(canvasHandle.canvas.height).toBe(50)
        expect(typeof canvasHandle.update).toBe('function')
    })

})


function createMockContainer () {
    const container = document.createElement('div')
    container._currentApp = null
    container.style = {}
    container.tabIndex = -1
    return container
}


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
