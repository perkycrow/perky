import LightDataTexture from './light_data_texture.js'
import Light3D from './light_3d.js'
import Vec3 from '../math/vec3.js'


function createMockGL () {
    const calls = []
    return {
        TEXTURE_2D: 0x0DE1,
        RGBA32F: 0x8814,
        RGBA: 0x1908,
        FLOAT: 0x1406,
        NEAREST: 0x2600,
        CLAMP_TO_EDGE: 0x812F,
        TEXTURE_MIN_FILTER: 0x2801,
        TEXTURE_MAG_FILTER: 0x2800,
        TEXTURE_WRAP_S: 0x2802,
        TEXTURE_WRAP_T: 0x2803,
        calls,
        createTexture () {
            calls.push({fn: 'createTexture'})
            return 'lightDataTex'
        },
        bindTexture (target, tex) {
            calls.push({fn: 'bindTexture', args: [target, tex]})
        },
        texImage2D (...args) {
            calls.push({fn: 'texImage2D', args})
        },
        texSubImage2D (...args) {
            calls.push({fn: 'texSubImage2D', args})
        },
        texParameteri (...args) {
            calls.push({fn: 'texParameteri', args})
        },
        deleteTexture (tex) {
            calls.push({fn: 'deleteTexture', args: [tex]})
        }
    }
}


describe('LightDataTexture', () => {

    test('creates RGBA32F texture on construction', () => {
        const gl = createMockGL()
        const ldt = new LightDataTexture(gl)
        expect(ldt.texture).toBe('lightDataTex')
        expect(ldt.capacity).toBe(256)
        const texCalls = gl.calls.filter(c => c.fn === 'texImage2D')
        expect(texCalls.length).toBe(1)
        expect(texCalls[0].args[2]).toBe(gl.RGBA32F)
        expect(texCalls[0].args[3]).toBe(2)
        expect(texCalls[0].args[4]).toBe(256)
    })


    test('custom capacity', () => {
        const gl = createMockGL()
        const ldt = new LightDataTexture(gl, {capacity: 64})
        expect(ldt.capacity).toBe(64)
        const texCalls = gl.calls.filter(c => c.fn === 'texImage2D')
        expect(texCalls[0].args[4]).toBe(64)
    })


    test('uses NEAREST filtering', () => {
        const gl = createMockGL()
        new LightDataTexture(gl)
        const minFilter = gl.calls.find(
            c => c.fn === 'texParameteri' && c.args[1] === gl.TEXTURE_MIN_FILTER
        )
        expect(minFilter.args[2]).toBe(gl.NEAREST)
        const magFilter = gl.calls.find(
            c => c.fn === 'texParameteri' && c.args[1] === gl.TEXTURE_MAG_FILTER
        )
        expect(magFilter.args[2]).toBe(gl.NEAREST)
    })

})


describe('update', () => {

    test('returns 0 for empty lights array', () => {
        const gl = createMockGL()
        const ldt = new LightDataTexture(gl)
        const count = ldt.update([], new Vec3(0, 0, 0))
        expect(count).toBe(0)
    })


    test('packs light data and uploads to texture', () => {
        const gl = createMockGL()
        const ldt = new LightDataTexture(gl)
        const lights = [
            new Light3D({x: 1, y: 2, z: 3, color: [1, 0.5, 0], intensity: 2, radius: 8})
        ]
        gl.calls.length = 0
        const count = ldt.update(lights, new Vec3(0, 0, 0))
        expect(count).toBe(1)

        const subCalls = gl.calls.filter(c => c.fn === 'texSubImage2D')
        expect(subCalls.length).toBe(1)
        const data = subCalls[0].args[8]
        expect(data[0]).toBe(1)
        expect(data[1]).toBe(2)
        expect(data[2]).toBe(3)
        expect(data[3]).toBe(2)
        expect(data[4]).toBe(1)
        expect(data[5]).toBe(0.5)
        expect(data[6]).toBe(0)
        expect(data[7]).toBe(8)
    })


    test('sorts lights by distance to camera', () => {
        const gl = createMockGL()
        const ldt = new LightDataTexture(gl)
        const lights = [
            new Light3D({x: 0, y: 0, z: -100, intensity: 1}),
            new Light3D({x: 0, y: 0, z: -1, intensity: 2}),
            new Light3D({x: 0, y: 0, z: -50, intensity: 3})
        ]
        gl.calls.length = 0
        ldt.update(lights, new Vec3(0, 0, 0))

        const data = gl.calls.find(c => c.fn === 'texSubImage2D').args[8]
        expect(data[3]).toBe(2)
        expect(data[11]).toBe(3)
        expect(data[19]).toBe(1)
    })


    test('caps at capacity', () => {
        const gl = createMockGL()
        const ldt = new LightDataTexture(gl, {capacity: 2})
        const lights = [
            new Light3D({x: 1}),
            new Light3D({x: 2}),
            new Light3D({x: 3})
        ]
        gl.calls.length = 0
        const count = ldt.update(lights, new Vec3(0, 0, 0))
        expect(count).toBe(2)
    })


    test('uploads correct subimage dimensions', () => {
        const gl = createMockGL()
        const ldt = new LightDataTexture(gl)
        const lights = [new Light3D(), new Light3D()]
        gl.calls.length = 0
        ldt.update(lights, new Vec3(0, 0, 0))

        const sub = gl.calls.find(c => c.fn === 'texSubImage2D')
        expect(sub.args[2]).toBe(0)
        expect(sub.args[3]).toBe(0)
        expect(sub.args[4]).toBe(2)
        expect(sub.args[5]).toBe(2)
    })

})


test('dispose deletes texture and clears references', () => {
    const gl = createMockGL()
    const ldt = new LightDataTexture(gl)
    gl.calls.length = 0
    ldt.dispose()
    const deleteCalls = gl.calls.filter(c => c.fn === 'deleteTexture')
    expect(deleteCalls.length).toBe(1)
    expect(ldt.texture).toBe(null)
})
