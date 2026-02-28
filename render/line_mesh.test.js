import LineMesh from './line_mesh.js'


function createMockGL () {
    const buffers = []
    const vaos = []
    const calls = []

    return {
        ARRAY_BUFFER: 0x8892,
        STATIC_DRAW: 0x88E4,
        FLOAT: 0x1406,
        LINES: 0x0001,
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
        drawArrays (mode, first, count) {
            calls.push({fn: 'drawArrays', args: [mode, first, count]})
        }
    }
}


describe('LineMesh', () => {

    test('creates buffer from positions', () => {
        const gl = createMockGL()
        const positions = new Float32Array([0, 0, 0, 1, 1, 1])
        const mesh = new LineMesh({gl, positions})

        expect(mesh.vertexCount).toBe(2)

        const bufferDataCalls = gl.calls.filter(c => c.fn === 'bufferData')
        expect(bufferDataCalls.length).toBe(1)
    })


    test('sets up position attribute at location 0', () => {
        const gl = createMockGL()
        const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0])
        new LineMesh({gl, positions})

        const attribCalls = gl.calls.filter(c => c.fn === 'vertexAttribPointer')
        expect(attribCalls.length).toBe(1)
        expect(attribCalls[0].args[0]).toBe(0)
        expect(attribCalls[0].args[1]).toBe(3)
    })


    test('draw calls drawArrays with GL_LINES', () => {
        const gl = createMockGL()
        const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0])
        const mesh = new LineMesh({gl, positions})

        gl.calls.length = 0
        mesh.draw()

        const drawCalls = gl.calls.filter(c => c.fn === 'drawArrays')
        expect(drawCalls.length).toBe(1)
        expect(drawCalls[0].args[0]).toBe(gl.LINES)
        expect(drawCalls[0].args[1]).toBe(0)
        expect(drawCalls[0].args[2]).toBe(4)
    })


    test('draw binds and unbinds VAO', () => {
        const gl = createMockGL()
        const positions = new Float32Array([0, 0, 0, 1, 0, 0])
        const mesh = new LineMesh({gl, positions})

        gl.calls.length = 0
        mesh.draw()

        const vaoCalls = gl.calls.filter(c => c.fn === 'bindVertexArray')
        expect(vaoCalls.length).toBe(2)
        expect(vaoCalls[0].args[0]).not.toBeNull()
        expect(vaoCalls[1].args[0]).toBeNull()
    })


    test('dispose deletes GPU resources', () => {
        const gl = createMockGL()
        const positions = new Float32Array([0, 0, 0, 1, 0, 0])
        const mesh = new LineMesh({gl, positions})

        expect(mesh.disposed).toBe(false)

        gl.calls.length = 0
        mesh.dispose()

        expect(mesh.disposed).toBe(true)

        const deleteCalls = gl.calls.filter(c => c.fn === 'deleteBuffer' || c.fn === 'deleteVertexArray')
        expect(deleteCalls.length).toBe(2)
    })


    test('dispose is idempotent', () => {
        const gl = createMockGL()
        const positions = new Float32Array([0, 0, 0, 1, 0, 0])
        const mesh = new LineMesh({gl, positions})

        mesh.dispose()
        gl.calls.length = 0
        mesh.dispose()

        const deleteCalls = gl.calls.filter(c => c.fn === 'deleteBuffer' || c.fn === 'deleteVertexArray')
        expect(deleteCalls.length).toBe(0)
    })

})
