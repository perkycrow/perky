import PerkyLogger from './perky_logger.js'
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
        expect(logger.entries).toEqual([])
    })


    test('constructor accepts custom attributes', () => {
        const customLogger = new PerkyLogger()
        customLogger.maxEntries = 100
        customLogger.position = 'top'
        customLogger.timestamp = true

        expect(customLogger.maxEntries).toBe(100)
        expect(customLogger.position).toBe('top')
        expect(customLogger.timestamp).toBe(true)
    })


    test('log creates a log entry with the specified type', () => {
        const message = 'Test message'
        const type = 'info'

        const entry = logger.log(message, type)

        expect(entry.className).toContain('logger-entry')
        expect(entry.className).toContain('log-info')
        expect(entry.querySelector('.logger-message').textContent).toBe(message)
        expect(logger.entries.length).toBe(1)
        expect(logger.entries[0]).toBe(entry)
    })


    test('log creates timestamp when enabled', () => {
        logger.timestamp = true
        const message = 'Test message with timestamp'

        const entry = logger.log(message, 'info')

        const timestamp = entry.querySelector('.logger-timestamp')
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
        expect(logger.entries[0].className).toContain('logger-spacer')
    })


    test('title creates a title entry', () => {
        logger.title('Test Title')

        expect(logger.entries.length).toBe(1)
        expect(logger.entries[0].className).toContain('logger-title-entry')
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


    test('render displays correct structure', () => {
        const loggerDiv = logger.shadowRoot.querySelector('.logger')
        const content = logger.shadowRoot.querySelector('.logger-content')

        expect(loggerDiv).toBeTruthy()
        expect(content).toBeTruthy()
    })


    test('entries are rendered in content', () => {
        logger.log('Test message', 'info')

        const content = logger.shadowRoot.querySelector('.logger-content')
        expect(content.children.length).toBe(1)
    })


    test('position updates logger classes', () => {
        logger.position = 'top'

        const loggerDiv = logger.shadowRoot.querySelector('.logger')

        expect(loggerDiv.className).toContain('logger')
        expect(loggerDiv.className).toContain('logger-top')
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


    test('log accepts html format', () => {
        const entry = logger.log('<strong>Bold</strong>', 'info', 'html')

        const message = entry.querySelector('.logger-message')
        expect(message.innerHTML).toContain('<strong>Bold</strong>')
    })


    test('log accepts element format', () => {
        const span = document.createElement('span')
        span.textContent = 'Element content'

        const entry = logger.log(span, 'info', 'element')

        const message = entry.querySelector('.logger-message')
        expect(message.contains(span)).toBe(true)
    })


    test('log accepts custom timestamp', () => {
        const customTime = new Date('2024-01-15T10:30:00')
        const entry = logger.log('Test', 'info', 'text', customTime.getTime())

        const timestamp = entry.querySelector('.logger-timestamp')
        expect(timestamp.textContent).toBe(customTime.toLocaleTimeString())
    })


    test('entry has copy button', () => {
        const entry = logger.log('Test message', 'info')

        const copyBtn = entry.querySelector('.logger-copy-btn')
        expect(copyBtn).not.toBeNull()
    })


    test('controls container exists', () => {
        const controls = logger.shadowRoot.querySelector('.logger-controls')
        expect(controls).not.toBeNull()
    })


    test('controls has clear button', () => {
        const controls = logger.shadowRoot.querySelector('.logger-controls')
        const buttons = controls.querySelectorAll('.logger-btn')

        expect(buttons.length).toBeGreaterThanOrEqual(1)
    })


    test('controls visibility updates on entry add', () => {
        const controls = logger.shadowRoot.querySelector('.logger-controls')

        expect(controls.classList.contains('has-entries')).toBe(false)

        logger.log('Test', 'info')

        expect(controls.classList.contains('has-entries')).toBe(true)
    })


    test('controls visibility updates on clear', () => {
        logger.log('Test', 'info')

        const controls = logger.shadowRoot.querySelector('.logger-controls')
        expect(controls.classList.contains('has-entries')).toBe(true)

        logger.clear()

        expect(controls.classList.contains('has-entries')).toBe(false)
    })

})
