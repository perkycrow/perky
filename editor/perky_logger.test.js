import PerkyLogger from './perky_logger'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


describe('PerkyLogger', () => {

    let logger


    beforeEach(() => {
        logger = new PerkyLogger()
        document.body.appendChild(logger)
    })


    afterEach(() => {
        document.body.innerHTML = ''
    })


    test('custom element creation', () => {
        expect(logger).toBeInstanceOf(PerkyLogger)
        expect(logger.tagName).toBe('PERKY-LOGGER')
    })


    test('constructor initializes with default options', () => {
        expect(logger.maxEntries).toBe(50)
        expect(logger.position).toBe('bottom')
        expect(logger.timestamp).toBe(false)
        expect(logger.collapsible).toBe(true)
        expect(logger.isMinimized).toBe(false)
        expect(logger.isCollapsed).toBe(false)
        expect(logger.entries).toEqual([])
    })


    test('constructor accepts custom attributes', () => {
        const customLogger = new PerkyLogger()
        customLogger.maxEntries = 100
        customLogger.position = 'top'
        customLogger.timestamp = true
        customLogger.collapsible = false

        expect(customLogger.maxEntries).toBe(100)
        expect(customLogger.position).toBe('top')
        expect(customLogger.timestamp).toBe(true)
        expect(customLogger.collapsible).toBe(false)
    })


    test('log creates a log entry with the specified type', () => {
        const message = 'Test message'
        const type = 'info'

        const entry = logger.log(message, type)

        expect(entry.className).toContain('perky-logger-entry')
        expect(entry.className).toContain('perky-logger-info')
        expect(entry.textContent).toBe(message)
        expect(logger.entries.length).toBe(1)
        expect(logger.entries[0]).toBe(entry)
    })


    test('log creates timestamp when enabled', () => {
        logger.timestamp = true
        const message = 'Test message with timestamp'

        const entry = logger.log(message, 'info')

        const timestamp = entry.querySelector('.perky-logger-timestamp')
        expect(timestamp).not.toBeNull()
        expect(entry.textContent).toContain(message)
    })


    test('log removes oldest entries when limit is reached', () => {
        logger.maxEntries = 3

        const entry1 = logger.log('Message 1', 'info')
        const entry2 = logger.log('Message 2', 'info')
        const entry3 = logger.log('Message 3', 'info')
        const entry4 = logger.log('Message 4', 'info')

        expect(logger.entries.length).toBe(3)
        expect(logger.entries).not.toContain(entry1)
        expect(logger.entries).toContain(entry2)
        expect(logger.entries).toContain(entry3)
        expect(logger.entries).toContain(entry4)
    })


    test('info logs a message with info type', () => {
        vi.spyOn(logger, 'log')

        logger.info('Info message')

        expect(logger.log).toHaveBeenCalledWith('Info message', 'info')
    })


    test('warn logs a message with warn type', () => {
        vi.spyOn(logger, 'log')

        logger.warn('Warning message')

        expect(logger.log).toHaveBeenCalledWith('Warning message', 'warn')
    })


    test('error logs a message with error type', () => {
        vi.spyOn(logger, 'log')

        logger.error('Error message')

        expect(logger.log).toHaveBeenCalledWith('Error message', 'error')
    })


    test('success logs a message with success type', () => {
        vi.spyOn(logger, 'log')

        logger.success('Success message')

        expect(logger.log).toHaveBeenCalledWith('Success message', 'success')
    })


    test('notice logs a message with notice type', () => {
        vi.spyOn(logger, 'log')

        logger.notice('Notice message')

        expect(logger.log).toHaveBeenCalledWith('Notice message', 'notice')
    })


    test('spacer creates a spacer entry', () => {
        logger.spacer()

        expect(logger.entries.length).toBe(1)
        expect(logger.entries[0].className).toContain('perky-logger-spacer')
    })


    test('title creates a title entry', () => {
        logger.title('Test Title')

        expect(logger.entries.length).toBe(1)
        expect(logger.entries[0].className).toContain('perky-logger-title-entry')
        expect(logger.entries[0].textContent).toBe('Test Title')
    })


    test('clear removes all entries', () => {
        logger.log('Message 1', 'info')
        logger.log('Message 2', 'warn')
        logger.log('Message 3', 'error')

        expect(logger.entries.length).toBe(3)

        logger.clear()

        expect(logger.entries.length).toBe(0)
    })


    test('toggle collapses and expands content', () => {
        expect(logger.isCollapsed).toBe(false)

        logger.toggle()

        expect(logger.isCollapsed).toBe(true)

        logger.toggle()

        expect(logger.isCollapsed).toBe(false)
    })


    test('toggle does nothing when collapsible is false', () => {
        logger.collapsible = false
        const initialCollapsed = logger.isCollapsed

        logger.toggle()

        expect(logger.isCollapsed).toBe(initialCollapsed)
    })


    test('toggle restores from minimized state', () => {
        logger.isMinimized = true
        logger.isCollapsed = true

        logger.toggle()

        expect(logger.isMinimized).toBe(false)
        expect(logger.isCollapsed).toBe(false)
    })


    test('minimize toggles the minimized state', () => {
        logger.minimize()

        expect(logger.isMinimized).toBe(true)

        logger.minimize()

        expect(logger.isMinimized).toBe(false)
        expect(logger.isCollapsed).toBe(false)
    })


    test('minimize uncollapes when collapsed', () => {
        logger.isCollapsed = true

        logger.minimize()

        expect(logger.isCollapsed).toBe(false)
    })


    test('render displays correct structure', () => {
        const loggerDiv = logger.shadowRoot.querySelector('.perky-logger')
        const header = logger.shadowRoot.querySelector('.perky-logger-header')
        const content = logger.shadowRoot.querySelector('.perky-logger-content')
        const miniIcon = logger.shadowRoot.querySelector('.perky-logger-mini-icon')

        expect(loggerDiv).toBeTruthy()
        expect(header).toBeTruthy()
        expect(content).toBeTruthy()
        expect(miniIcon).toBeTruthy()
    })


    test('entries are rendered in content', () => {
        logger.log('Test message', 'info')

        const content = logger.shadowRoot.querySelector('.perky-logger-content')
        expect(content.children.length).toBe(1)
    })


    test('getLoggerClasses returns correct classes', () => {
        logger.position = 'top'
        logger.isMinimized = true

        const classes = logger.getLoggerClasses()

        expect(classes).toContain('perky-logger')
        expect(classes).toContain('perky-logger-top')
        expect(classes).toContain('perky-logger-minimized')
    })


    test('multiple message arguments are formatted correctly', () => {
        logger.info('Message', 123, {key: 'value'})

        expect(logger.entries.length).toBe(1)
        expect(logger.entries[0].textContent).toContain('Message')
        expect(logger.entries[0].textContent).toContain('123')
        expect(logger.entries[0].textContent).toContain('key')
    })


    test('can be used like a DOM element', () => {
        const container = document.createElement('div')
        const newLogger = new PerkyLogger()

        container.appendChild(newLogger)

        expect(container.contains(newLogger)).toBe(true)
        expect(newLogger.parentElement).toBe(container)

        newLogger.info('Test message')
        expect(newLogger.entries.length).toBe(1)
    })


    test('theme property works correctly', () => {
        expect(logger.theme).toBe('')

        logger.theme = 'light'

        expect(logger.theme).toBe('light')
        expect(logger.hasAttribute('theme')).toBe(true)
        expect(logger.getAttribute('theme')).toBe('light')

        logger.theme = ''

        expect(logger.theme).toBe('')
        expect(logger.hasAttribute('theme')).toBe(false)
    })

})
