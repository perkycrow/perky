import {test, expect, vi, beforeEach} from 'vitest'
import fs from 'fs'
import {parseDocFile} from './doc_parser.js'


vi.mock('fs')


beforeEach(() => {
    vi.clearAllMocks()
})


test('parseDocFile parses code blocks', () => {
    const source = `
        import {doc, code} from './runtime.js'

        export default doc('Test', () => {
            code('Example', () => {
                const x = 1
                return x + 1
            })
        })
    `

    fs.readFileSync.mockReturnValue(source)

    const blocks = parseDocFile('test.doc.js')

    expect(blocks).toHaveLength(1)
    expect(blocks[0].type).toBe('code')
    expect(blocks[0].title).toBe('Example')
    expect(blocks[0].source).toContain('const x = 1')
})


test('parseDocFile parses action blocks', () => {
    const source = `
        import {doc, action} from './runtime.js'

        export default doc('Test', () => {
            action('Run test', () => {
                console.log('running')
            })
        })
    `

    fs.readFileSync.mockReturnValue(source)

    const blocks = parseDocFile('test.doc.js')

    expect(blocks).toHaveLength(1)
    expect(blocks[0].type).toBe('action')
    expect(blocks[0].title).toBe('Run test')
})


test('parseDocFile parses container blocks', () => {
    const source = `
        import {doc, container} from './runtime.js'

        export default doc('Test', () => {
            container({title: 'Demo'}, () => {
                const el = document.createElement('div')
            })
        })
    `

    fs.readFileSync.mockReturnValue(source)

    const blocks = parseDocFile('test.doc.js')

    expect(blocks).toHaveLength(1)
    expect(blocks[0].type).toBe('container')
    expect(blocks[0].title).toBe('Demo')
})


test('parseDocFile returns empty array for invalid syntax', () => {
    fs.readFileSync.mockReturnValue('not valid { js [')

    const blocks = parseDocFile('test.doc.js')

    expect(blocks).toEqual([])
})


test('parseDocFile returns empty array for file without blocks', () => {
    const source = `
        const x = 1
        export default x
    `

    fs.readFileSync.mockReturnValue(source)

    const blocks = parseDocFile('test.doc.js')

    expect(blocks).toEqual([])
})


test('parseDocFile parses multiple blocks', () => {
    const source = `
        import {doc, code, action} from './runtime.js'

        export default doc('Test', () => {
            code('First', () => {
                const a = 1
            })
            action('Second', () => {
                console.log('action')
            })
        })
    `

    fs.readFileSync.mockReturnValue(source)

    const blocks = parseDocFile('test.doc.js')

    expect(blocks).toHaveLength(2)
    expect(blocks[0].type).toBe('code')
    expect(blocks[0].title).toBe('First')
    expect(blocks[1].type).toBe('action')
    expect(blocks[1].title).toBe('Second')
})


test('parseDocFile filters out ctx.setApp lines', () => {
    const source = `
        import {doc, code} from './runtime.js'

        export default doc('Test', () => {
            code('Example', () => {
                ctx.setApp(app)
                const x = 1
            })
        })
    `

    fs.readFileSync.mockReturnValue(source)

    const blocks = parseDocFile('test.doc.js')

    expect(blocks[0].source).not.toContain('ctx.setApp')
    expect(blocks[0].source).toContain('const x = 1')
})
