import Mesh from './mesh.js'
import Geometry from './geometry.js'


function createMockGL () {
    const buffers = []
    const vaos = []
    const calls = []

    return {
        ARRAY_BUFFER: 0x8892,
        ELEMENT_ARRAY_BUFFER: 0x8893,
        STATIC_DRAW: 0x88E4,
        FLOAT: 0x1406,
        TRIANGLES: 0x0004,
        UNSIGNED_SHORT: 0x1403,
        calls,
        createBuffer () {
            const buf = {id: buffers.length}
            buffers.push(buf)
            return buf
        },
        deleteBuffer (buf) {
            calls.push({fn: 'deleteBuffer', args: [buf]})
        },
        createVertexArray () {
            const vao = {id: vaos.length}
            vaos.push(vao)
            return vao
        },
        deleteVertexArray (vao) {
            calls.push({fn: 'deleteVertexArray', args: [vao]})
        },
        bindBuffer (target, buffer) {
            calls.push({fn: 'bindBuffer', args: [target, buffer]})
        },
        bufferData (target, data, usage) {
            calls.push({fn: 'bufferData', args: [target, data, usage]})
        },
        bindVertexArray (vao) {
            calls.push({fn: 'bindVertexArray', args: [vao]})
        },
        enableVertexAttribArray (index) {
            calls.push({fn: 'enableVertexAttribArray', args: [index]})
        },
        vertexAttribPointer (...args) {
            calls.push({fn: 'vertexAttribPointer', args})
        },
        drawElements (mode, count, type, offset) {
            calls.push({fn: 'drawElements', args: [mode, count, type, offset]})
        }
    }
}


describe('Mesh', () => {

    test('creates buffers from geometry', () => {
        const gl = createMockGL()
        const geometry = Geometry.createBox(1, 1, 1)
        const mesh = new Mesh(gl, geometry)

        expect(mesh.indexCount).toBe(36)

        const bufferDataCalls = gl.calls.filter(c => c.fn === 'bufferData')
        expect(bufferDataCalls.length).toBe(4)
    })


    test('sets up vertex attributes', () => {
        const gl = createMockGL()
        const geometry = Geometry.createBox(1, 1, 1)
        new Mesh(gl, geometry)  

        const attribCalls = gl.calls.filter(c => c.fn === 'vertexAttribPointer')
        expect(attribCalls.length).toBe(3)

        expect(attribCalls[0].args[0]).toBe(0)
        expect(attribCalls[0].args[1]).toBe(3)

        expect(attribCalls[1].args[0]).toBe(1)
        expect(attribCalls[1].args[1]).toBe(3)

        expect(attribCalls[2].args[0]).toBe(2)
        expect(attribCalls[2].args[1]).toBe(2)
    })


    test('draw calls drawElements with correct count', () => {
        const gl = createMockGL()
        const geometry = Geometry.createBox(1, 1, 1)
        const mesh = new Mesh(gl, geometry)

        gl.calls.length = 0
        mesh.draw()

        const drawCalls = gl.calls.filter(c => c.fn === 'drawElements')
        expect(drawCalls.length).toBe(1)
        expect(drawCalls[0].args[0]).toBe(gl.TRIANGLES)
        expect(drawCalls[0].args[1]).toBe(36)
        expect(drawCalls[0].args[2]).toBe(gl.UNSIGNED_SHORT)
    })


    test('draw binds and unbinds VAO', () => {
        const gl = createMockGL()
        const geometry = Geometry.createBox(1, 1, 1)
        const mesh = new Mesh(gl, geometry)

        gl.calls.length = 0
        mesh.draw()

        const vaoCalls = gl.calls.filter(c => c.fn === 'bindVertexArray')
        expect(vaoCalls.length).toBe(2)
        expect(vaoCalls[0].args[0]).not.toBeNull()
        expect(vaoCalls[1].args[0]).toBeNull()
    })


    test('dispose deletes GPU resources', () => {
        const gl = createMockGL()
        const geometry = Geometry.createBox(1, 1, 1)
        const mesh = new Mesh(gl, geometry)

        expect(mesh.disposed).toBe(false)

        gl.calls.length = 0
        mesh.dispose()

        expect(mesh.disposed).toBe(true)

        const deleteCalls = gl.calls.filter(c => c.fn === 'deleteBuffer' || c.fn === 'deleteVertexArray')
        expect(deleteCalls.length).toBe(5)
    })


    test('dispose is idempotent', () => {
        const gl = createMockGL()
        const geometry = Geometry.createBox(1, 1, 1)
        const mesh = new Mesh(gl, geometry)

        mesh.dispose()
        gl.calls.length = 0
        mesh.dispose()

        const deleteCalls = gl.calls.filter(c => c.fn === 'deleteBuffer' || c.fn === 'deleteVertexArray')
        expect(deleteCalls.length).toBe(0)
    })

})
