import Logger from './logger'
import {vi, beforeEach, describe, test, expect, afterEach} from 'vitest'


describe('Logger', () => {
    let logger

    beforeEach(() => {
        global.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
        }))

        logger = new Logger()
        document.body.appendChild(logger.element)
    })


    afterEach(() => {
        vi.restoreAllMocks()
        document.body.innerHTML = ''
        delete global.ResizeObserver
    })


    test('constructor initializes with default options', () => {
        expect(logger.options.maxEntries).toBe(50)
        expect(logger.options.position).toBe('bottom')
        expect(logger.options.timestamp).toBe(false)
        expect(logger.options.collapsible).toBe(true)
        expect(logger.entries).toEqual([])
        expect(logger.isMinimized).toBe(false)
        expect(logger.isCollapsed).toBe(false)
        expect(logger.loggerElement.classList.contains('perky-logger-bottom')).toBe(true)
    })


    test('constructor accepts custom options', () => {
        const customOptions = {
            maxEntries: 100,
            position: 'top',
            timestamp: true,
            collapsible: false
        }
        
        const customLogger = new Logger({options: customOptions})
        
        expect(customLogger.options.maxEntries).toBe(100)
        expect(customLogger.options.position).toBe('top')
        expect(customLogger.options.timestamp).toBe(true)
        expect(customLogger.options.collapsible).toBe(false)
        expect(customLogger.loggerElement.classList.contains('perky-logger-top')).toBe(true)
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
        logger.options.timestamp = true
        const message = 'Test message with timestamp'
        
        const entry = logger.log(message, 'info')
        
        const timestamp = entry.querySelector('.perky-logger-timestamp')
        expect(timestamp).not.toBeNull()
        expect(entry.textContent).toContain(message)
    })


    test('log removes oldest entries when limit is reached', () => {
        logger.options.maxEntries = 3
        
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


    test('clear removes all entries', () => {
        logger.log('Message 1', 'info')
        logger.log('Message 2', 'warn')
        logger.log('Message 3', 'error')
        
        expect(logger.entries.length).toBe(3)
        
        logger.clear()
        
        expect(logger.entries.length).toBe(0)
        expect(logger.loggerContent.childNodes.length).toBe(0)
    })


    test('toggle collapses and expands content', () => {
        expect(logger.isCollapsed).toBe(false)

        logger.toggle()
        
        expect(logger.isCollapsed).toBe(true)
        expect(logger.loggerContent.style.display).toBe('none')
        expect(logger.minimizeButton.innerHTML).toBe('+')

        logger.toggle()
        
        expect(logger.isCollapsed).toBe(false)
        expect(logger.loggerContent.style.display).toBe('block')
        expect(logger.minimizeButton.innerHTML).toBe('-')
    })


    test('toggle does nothing when collapsible is false', () => {
        logger.options.collapsible = false
        logger.loggerContent.style.display = 'block'
        
        logger.toggle()
        
        expect(logger.isCollapsed).toBe(false)
        expect(logger.loggerContent.style.display).toBe('block')
    })


    test('toggle restores from minimized state', () => {
        logger.isMinimized = true
        logger.loggerHeader.style.display = 'none'
        logger.loggerContent.style.display = 'none'
        logger.miniIcon.style.display = 'flex'
        logger.loggerElement.classList.add('perky-logger-minimized')
        
        logger.toggle()
        
        expect(logger.isMinimized).toBe(false)
        expect(logger.isCollapsed).toBe(false)
        expect(logger.loggerHeader.style.display).toBe('flex')
        expect(logger.loggerContent.style.display).toBe('block')
        expect(logger.miniIcon.style.display).toBe('none')
        expect(logger.loggerElement.classList.contains('perky-logger-minimized')).toBe(false)
    })


    test('minimize collapses the logger to icon', () => {
        logger.minimize()
        
        expect(logger.isMinimized).toBe(true)
        expect(logger.loggerHeader.style.display).toBe('none')
        expect(logger.loggerContent.style.display).toBe('none')
        expect(logger.miniIcon.style.display).toBe('flex')
        expect(logger.loggerElement.classList.contains('perky-logger-minimized')).toBe(true)
    })


    test('minimize restores from minimized state', () => {
        logger.minimize()

        logger.minimize()
        
        expect(logger.isMinimized).toBe(false)
        expect(logger.isCollapsed).toBe(false)
        expect(logger.loggerHeader.style.display).toBe('flex')
        expect(logger.loggerContent.style.display).toBe('block')
        expect(logger.miniIcon.style.display).toBe('none')
        expect(logger.loggerElement.classList.contains('perky-logger-minimized')).toBe(false)
    })


    test('minimize uncollapes when collapsed', () => {
        logger.toggle()
        expect(logger.isCollapsed).toBe(true)
        
        logger.minimize()
        
        expect(logger.isCollapsed).toBe(false)
        expect(logger.loggerContent.style.display).toBe('block')
        expect(logger.minimizeButton.innerHTML).toBe('-')
    })


    test('events trigger corresponding methods', () => {
        const minimizeSpy = vi.spyOn(logger, 'minimize')
        const toggleSpy = vi.spyOn(logger, 'toggle')
        const clearSpy = vi.spyOn(logger, 'clear')

        logger.minimizeButton.click()
        expect(minimizeSpy).toHaveBeenCalled()

        logger.miniIcon.click()
        expect(toggleSpy).toHaveBeenCalled()

        logger.clearButton.click()
        expect(clearSpy).toHaveBeenCalled()

        toggleSpy.mockClear()
        logger.loggerHeader.click()
        expect(toggleSpy).toHaveBeenCalled()
    })

})
