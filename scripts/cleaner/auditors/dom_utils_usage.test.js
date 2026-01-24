import {describe, test, expect} from 'vitest'
import DomUtilsUsageAuditor from './dom_utils_usage.js'


describe('DomUtilsUsageAuditor', () => {

    function analyze (code) {
        const auditor = new DomUtilsUsageAuditor('.', {silent: true})
        return auditor.analyze(code)
    }


    describe('createElement sequences', () => {

        test('detects createElement with 2+ consecutive operations', () => {
            const code = `
                const btn = document.createElement('button')
                btn.className = 'foo'
                btn.textContent = 'Click'
            `
            const issues = analyze(code)
            expect(issues.length).toBe(1)
            expect(issues[0]).toContain("createElement('button')")
            expect(issues[0]).toContain('2 ops')
        })


        test('detects createElement with many operations', () => {
            const code = `
                const el = document.createElement('div')
                el.className = 'container'
                el.id = 'main'
                el.textContent = 'Hello'
                el.setAttribute('data-test', 'value')
            `
            const issues = analyze(code)
            expect(issues.length).toBe(1)
            expect(issues[0]).toContain('4 ops')
        })


        test('detects createElement with single supported operation', () => {
            const code = `
                const btn = document.createElement('button')
                btn.className = 'foo'
                someOtherCode()
            `
            const issues = analyze(code)
            expect(issues.length).toBe(1)
            expect(issues[0]).toContain('1 ops')
        })


        test('ignores createElement with only unsupported operations', () => {
            const code = `
                const btn = document.createElement('button')
                btn.addEventListener('click', handler)
                btn.appendChild(child)
            `
            const issues = analyze(code)
            expect(issues.length).toBe(0)
        })


        test('ignores createElement without operations', () => {
            const code = `
                const btn = document.createElement('button')
                container.appendChild(btn)
            `
            const issues = analyze(code)
            expect(issues.length).toBe(0)
        })

    })


    describe('setAttribute sequences', () => {

        test('detects multiple consecutive setAttribute calls', () => {
            const code = `
                function setup() {
                    el.setAttribute('disabled', '')
                    el.setAttribute('aria-label', 'test')
                }
            `
            const issues = analyze(code)
            expect(issues.length).toBe(1)
            expect(issues[0]).toContain('setAttribute()')
            expect(issues[0]).toContain('x2')
        })


        test('detects setAttribute on this.member', () => {
            const code = `
                class Foo {
                    bar() {
                        this.el.setAttribute('a', '1')
                        this.el.setAttribute('b', '2')
                        this.el.setAttribute('c', '3')
                    }
                }
            `
            const issues = analyze(code)
            expect(issues.length).toBe(1)
            expect(issues[0]).toContain('x3')
        })


        test('detects single setAttribute call', () => {
            const code = `
                function setup() {
                    el.setAttribute('disabled', '')
                    el.className = 'foo'
                }
            `
            const issues = analyze(code)
            expect(issues.length).toBe(1)
        })

    })


    describe('class methods', () => {

        test('scans methods inside export default class', () => {
            const code = `
                export default class MyComponent {
                    build() {
                        const div = document.createElement('div')
                        div.className = 'test'
                        div.id = 'main'
                    }
                }
            `
            const issues = analyze(code)
            expect(issues.length).toBe(1)
        })


        test('scans methods inside regular class', () => {
            const code = `
                class Helper {
                    render() {
                        const span = document.createElement('span')
                        span.textContent = 'hi'
                        span.className = 'label'
                    }
                }
            `
            const issues = analyze(code)
            expect(issues.length).toBe(1)
        })

    })


    describe('class property assignments', () => {

        test('detects createElement assigned to this.property', () => {
            const code = `
                class Foo {
                    bar() {
                        this.element = document.createElement('div')
                        this.element.className = 'container'
                        this.element.id = 'main'
                    }
                }
            `
            const issues = analyze(code)
            expect(issues.length).toBe(1)
            expect(issues[0]).toContain("createElement('div')")
            expect(issues[0]).toContain('2 ops')
        })


        test('detects createElement assigned to this.#privateProperty', () => {
            const code = `
                class Foo {
                    #checkbox

                    bar() {
                        this.#checkbox = document.createElement('input')
                        this.#checkbox.type = 'checkbox'
                        this.#checkbox.className = 'my-checkbox'
                        this.#checkbox.id = 'cb-1'
                    }
                }
            `
            const issues = analyze(code)
            expect(issues.length).toBe(1)
            expect(issues[0]).toContain("createElement('input')")
            expect(issues[0]).toContain('3 ops')
        })


        test('detects style property on this.#privateProperty', () => {
            const code = `
                class Foo {
                    #el

                    bar() {
                        this.#el = document.createElement('div')
                        this.#el.className = 'box'
                        this.#el.style.left = '10px'
                    }
                }
            `
            const issues = analyze(code)
            expect(issues.length).toBe(1)
            expect(issues[0]).toContain('.style.left')
        })

    })


    describe('nested blocks', () => {

        test('scans inside if statements', () => {
            const code = `
                class Foo {
                    bar() {
                        if (true) {
                            const el = document.createElement('div')
                            el.className = 'a'
                            el.id = 'b'
                        }
                    }
                }
            `
            const issues = analyze(code)
            expect(issues.length).toBe(1)
        })


        test('scans inside for loops', () => {
            const code = `
                class Foo {
                    bar() {
                        for (const item of items) {
                            const li = document.createElement('li')
                            li.textContent = item
                            li.className = 'item'
                        }
                    }
                }
            `
            const issues = analyze(code)
            expect(issues.length).toBe(1)
        })

    })

})
