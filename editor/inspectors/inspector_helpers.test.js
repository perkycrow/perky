import {describe, test, expect, beforeEach, afterEach, vi} from 'vitest'
import {
    createToggle,
    createSlider,
    createColorRow,
    getEditableUniforms,
    renderUniformSlider,
    renderTransformProperty,
    passStyles,
    renderPass,
    renderTransform
} from './inspector_helpers.js'


class MockToggleInput extends HTMLElement {

    #checked = false


    set checked (v) {
        this.#checked = v
    }


    get checked () {
        return this.#checked
    }

}


class MockSliderInput extends HTMLElement {

    #value = 0


    set value (v) {
        this.#value = v
    }


    get value () {
        return this.#value
    }

}


if (!customElements.get('toggle-input')) {
    customElements.define('toggle-input', MockToggleInput)
}


if (!customElements.get('slider-input')) {
    customElements.define('slider-input', MockSliderInput)
}


describe('inspector_helpers', () => {

    let container


    beforeEach(() => {
        container = document.createElement('div')
        document.body.appendChild(container)
    })


    afterEach(() => {
        container.remove()
    })


    describe('createToggle', () => {

        test('creates container with toggle-input', () => {
            const result = createToggle('Test', true, () => {})
            expect(result.tagName).toBe('DIV')

            const toggle = result.querySelector('toggle-input')
            expect(toggle).not.toBeNull()
        })


        test('sets checked state', () => {
            const result = createToggle('Test', true, () => {})
            const toggle = result.querySelector('toggle-input')
            expect(toggle.checked).toBe(true)
        })


        test('sets label attribute', () => {
            const result = createToggle('My Label', false, () => {})
            const toggle = result.querySelector('toggle-input')
            expect(toggle.getAttribute('label')).toBe('My Label')
        })


        test('calls onChange when change event fires', () => {
            const onChange = vi.fn()
            const result = createToggle('Test', false, onChange)
            const toggle = result.querySelector('toggle-input')

            toggle.dispatchEvent(new CustomEvent('change', {detail: {checked: true}}))

            expect(onChange).toHaveBeenCalledWith(true)
        })

    })


    describe('createSlider', () => {

        test('creates container with slider-input', () => {
            const result = createSlider('Test', 0.5, {min: 0, max: 1, step: 0.1}, () => {})
            expect(result.tagName).toBe('DIV')

            const slider = result.querySelector('slider-input')
            expect(slider).not.toBeNull()
        })


        test('sets value', () => {
            const result = createSlider('Test', 0.75, {min: 0, max: 1, step: 0.1}, () => {})
            const slider = result.querySelector('slider-input')
            expect(slider.value).toBe(0.75)
        })


        test('sets min/max/step attributes', () => {
            const result = createSlider('Test', 50, {min: 0, max: 100, step: 5}, () => {})
            const slider = result.querySelector('slider-input')

            expect(slider.getAttribute('min')).toBe('0')
            expect(slider.getAttribute('max')).toBe('100')
            expect(slider.getAttribute('step')).toBe('5')
        })


        test('sets label attribute', () => {
            const result = createSlider('Volume', 0.5, {min: 0, max: 1, step: 0.1}, () => {})
            const slider = result.querySelector('slider-input')
            expect(slider.getAttribute('label')).toBe('Volume')
        })


        test('calls onChange when change event fires', () => {
            const onChange = vi.fn()
            const result = createSlider('Test', 0.5, {min: 0, max: 1, step: 0.1}, onChange)
            const slider = result.querySelector('slider-input')

            slider.dispatchEvent(new CustomEvent('change', {detail: {value: 0.8}}))

            expect(onChange).toHaveBeenCalledWith(0.8)
        })

    })


    describe('createColorRow', () => {

        test('creates row element', () => {
            const result = createColorRow('color', [1, 0, 0, 1], () => {})
            expect(result.className).toBe('inspector-row')
        })


        test('creates label element', () => {
            const result = createColorRow('tint', [0, 1, 0, 1], () => {})
            const label = result.querySelector('.inspector-row-label')
            expect(label).not.toBeNull()
            expect(label.textContent).toBe('tint')
        })


        test('creates color swatch', () => {
            const result = createColorRow('color', [1, 0, 0, 1], () => {})
            const swatch = result.querySelector('.inspector-color-swatch')
            expect(swatch).not.toBeNull()
        })


        test('creates hidden color input', () => {
            const result = createColorRow('color', [1, 0, 0, 1], () => {})
            const input = result.querySelector('input[type="color"]')
            expect(input).not.toBeNull()
        })

    })


    describe('getEditableUniforms', () => {

        test('returns empty array for pass with no defaults', () => {
            const pass = {uniforms: {}}
            const result = getEditableUniforms(pass)
            expect(result).toEqual([])
        })


        test('filters to numeric uniforms only', () => {
            const pass = {
                constructor: {
                    defaultUniforms: {
                        uFloat: 1.0,
                        uString: 'hello'
                    }
                },
                uniforms: {}
            }
            const result = getEditableUniforms(pass)
            expect(result.length).toBe(1)
            expect(result[0].name).toBe('uFloat')
        })


        test('includes current value', () => {
            const pass = {
                constructor: {
                    defaultUniforms: {uValue: 0.5}
                },
                uniforms: {uValue: 0.8}
            }
            const result = getEditableUniforms(pass)
            expect(result[0].currentValue).toBe(0.8)
        })


        test('uses default value when no current value', () => {
            const pass = {
                constructor: {
                    defaultUniforms: {uValue: 0.5}
                },
                uniforms: {}
            }
            const result = getEditableUniforms(pass)
            expect(result[0].currentValue).toBe(0.5)
        })


        test('includes config from uniformConfig', () => {
            const pass = {
                constructor: {
                    defaultUniforms: {uValue: 0.5},
                    uniformConfig: {uValue: {min: 0, max: 2, step: 0.1}}
                },
                uniforms: {}
            }
            const result = getEditableUniforms(pass)
            expect(result[0].config).toEqual({min: 0, max: 2, step: 0.1})
        })

    })


    describe('renderUniformSlider', () => {

        test('creates slider-input element', () => {
            const pass = {setUniform: vi.fn()}
            const uniform = {
                name: 'uBrightness',
                currentValue: 0.5,
                config: {min: 0, max: 1, step: 0.01}
            }

            renderUniformSlider(container, pass, uniform)

            const slider = container.querySelector('slider-input')
            expect(slider).not.toBeNull()
        })


        test('sets slider value from uniform', () => {
            const pass = {setUniform: vi.fn()}
            const uniform = {
                name: 'uValue',
                currentValue: 0.75,
                config: {min: 0, max: 1, step: 0.01}
            }

            renderUniformSlider(container, pass, uniform)

            const slider = container.querySelector('slider-input')
            expect(slider.value).toBe(0.75)
        })


        test('strips u prefix from label', () => {
            const pass = {setUniform: vi.fn()}
            const uniform = {
                name: 'uBrightness',
                currentValue: 0.5,
                config: {min: 0, max: 1, step: 0.01}
            }

            renderUniformSlider(container, pass, uniform)

            const slider = container.querySelector('slider-input')
            expect(slider.getAttribute('label')).toBe('Brightness')
        })


        test('calls setUniform on change', () => {
            const pass = {setUniform: vi.fn()}
            const uniform = {
                name: 'uValue',
                currentValue: 0.5,
                config: {min: 0, max: 1, step: 0.01}
            }

            renderUniformSlider(container, pass, uniform)

            const slider = container.querySelector('slider-input')
            slider.dispatchEvent(new CustomEvent('change', {detail: {value: 0.9}}))

            expect(pass.setUniform).toHaveBeenCalledWith('uValue', 0.9)
        })

    })


    describe('renderTransformProperty', () => {

        test('creates slider for numeric property', () => {
            const transform = {opacity: 0.5}
            const config = {min: 0, max: 1, step: 0.01}

            renderTransformProperty(container, transform, 'opacity', config)

            const slider = container.querySelector('slider-input')
            expect(slider).not.toBeNull()
            expect(slider.value).toBe(0.5)
        })


        test('updates transform on slider change', () => {
            const transform = {opacity: 0.5}
            const config = {min: 0, max: 1, step: 0.01}

            renderTransformProperty(container, transform, 'opacity', config)

            const slider = container.querySelector('slider-input')
            slider.dispatchEvent(new CustomEvent('change', {detail: {value: 0.8}}))

            expect(transform.opacity).toBe(0.8)
        })


        test('creates color row for color type', () => {
            const transform = {color: [1, 0, 0, 1]}
            const config = {type: 'color'}

            renderTransformProperty(container, transform, 'color', config)

            const row = container.querySelector('.inspector-row')
            expect(row).not.toBeNull()
        })

    })


    describe('passStyles', () => {

        test('is a non-empty string', () => {
            expect(typeof passStyles).toBe('string')
            expect(passStyles.length).toBeGreaterThan(0)
        })


        test('contains expected CSS classes', () => {
            expect(passStyles).toContain('.pass-section')
            expect(passStyles).toContain('.pass-header')
            expect(passStyles).toContain('.pass-uniforms')
        })

    })


    describe('renderPass', () => {

        test('creates pass-section element', () => {
            const pass = {
                enabled: true,
                constructor: {name: 'BlurPass', defaultUniforms: {}},
                uniforms: {}
            }

            renderPass(container, pass)

            const section = container.querySelector('.pass-section')
            expect(section).not.toBeNull()
        })


        test('creates toggle for enabled state', () => {
            const pass = {
                enabled: true,
                constructor: {name: 'BlurPass', defaultUniforms: {}},
                uniforms: {}
            }

            renderPass(container, pass)

            const toggle = container.querySelector('toggle-input')
            expect(toggle).not.toBeNull()
            expect(toggle.checked).toBe(true)
        })


        test('updates pass.enabled on toggle change', () => {
            const pass = {
                enabled: true,
                constructor: {name: 'BlurPass', defaultUniforms: {}},
                uniforms: {}
            }

            renderPass(container, pass)

            const toggle = container.querySelector('toggle-input')
            toggle.dispatchEvent(new CustomEvent('change', {detail: {checked: false}}))

            expect(pass.enabled).toBe(false)
        })

    })


    describe('renderTransform', () => {

        test('adds none row when transform is null', () => {
            const addRow = vi.fn()
            renderTransform(container, addRow, null)
            expect(addRow).toHaveBeenCalledWith('transform', 'none')
        })


        test('creates pass-section for transform', () => {
            const transform = {
                enabled: true,
                constructor: {name: 'TestTransform'},
                getPropertyConfig: () => ({})
            }

            renderTransform(container, vi.fn(), transform)

            const section = container.querySelector('.pass-section')
            expect(section).not.toBeNull()
        })


        test('creates toggle for transform enabled state', () => {
            const transform = {
                enabled: false,
                constructor: {name: 'TestTransform'},
                getPropertyConfig: () => ({})
            }

            renderTransform(container, vi.fn(), transform)

            const toggle = container.querySelector('toggle-input')
            expect(toggle).not.toBeNull()
            expect(toggle.checked).toBe(false)
        })


        test('renders properties from getPropertyConfig', () => {
            const transform = {
                enabled: true,
                constructor: {name: 'TestTransform'},
                getPropertyConfig: () => ({
                    scale: {min: 0, max: 2, step: 0.1}
                }),
                scale: 1.0
            }

            renderTransform(container, vi.fn(), transform)

            const slider = container.querySelector('slider-input')
            expect(slider).not.toBeNull()
        })

    })

})
