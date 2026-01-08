import {describe, test, expect, beforeEach, vi} from 'vitest'
import FullscreenQuad from './fullscreen_quad.js'
import {createMockGLWithSpies} from '../../test/helpers.js'


function createMockProgram (hasTexCoord = true) {
    return {
        attributes: {
            aPosition: 0,
            aTexCoord: hasTexCoord ? 1 : undefined
        }
    }
}


describe(FullscreenQuad, () => {

    let gl
    let quad

    beforeEach(() => {
        gl = createMockGLWithSpies()
        quad = new FullscreenQuad(gl)
    })


    test('constructor creates buffers', () => {
        expect(gl.createBuffer).toHaveBeenCalledTimes(2)
        expect(gl.bindBuffer).toHaveBeenCalled()
        expect(gl.bufferData).toHaveBeenCalledTimes(2)
    })


    test('draw', () => {
        const program = createMockProgram()
        quad.draw(gl, program)

        expect(gl.bindBuffer).toHaveBeenCalled()
        expect(gl.enableVertexAttribArray).toHaveBeenCalledWith(0)
        expect(gl.enableVertexAttribArray).toHaveBeenCalledWith(1)
        expect(gl.vertexAttribPointer).toHaveBeenCalledTimes(2)
        expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_STRIP, 0, 4)
    })


    test('draw without aTexCoord attribute', () => {
        const program = createMockProgram(false)
        quad.draw(gl, program)

        expect(gl.enableVertexAttribArray).toHaveBeenCalledWith(0)
        expect(gl.enableVertexAttribArray).toHaveBeenCalledTimes(1)
        expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_STRIP, 0, 4)
    })


    test('draw with missing aPosition warns', () => {
        const program = {attributes: {aPosition: undefined}}
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        quad.draw(gl, program)

        expect(warnSpy).toHaveBeenCalledWith('FullscreenQuad: aPosition attribute not found')
        expect(gl.drawArrays).not.toHaveBeenCalled()

        warnSpy.mockRestore()
    })


    test('draw with aPosition = -1 warns', () => {
        const program = {attributes: {aPosition: -1}}
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        quad.draw(gl, program)

        expect(warnSpy).toHaveBeenCalledWith('FullscreenQuad: aPosition attribute not found')
        expect(gl.drawArrays).not.toHaveBeenCalled()

        warnSpy.mockRestore()
    })


    test('draw with aTexCoord = -1 skips texcoord setup', () => {
        const program = {attributes: {aPosition: 0, aTexCoord: -1}}
        quad.draw(gl, program)

        expect(gl.enableVertexAttribArray).toHaveBeenCalledTimes(1)
        expect(gl.enableVertexAttribArray).toHaveBeenCalledWith(0)
        expect(gl.drawArrays).toHaveBeenCalled()
    })


    test('dispose', () => {
        quad.dispose(gl)

        expect(gl.deleteBuffer).toHaveBeenCalledTimes(2)
    })


    test('dispose can be called multiple times', () => {
        quad.dispose(gl)
        quad.dispose(gl)

        expect(gl.deleteBuffer).toHaveBeenCalledTimes(2)
    })

})
