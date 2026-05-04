import {describe, test, expect, beforeEach, vi} from 'vitest'
import PaintEngine, {interpolateStroke, smoothPoint} from './paint_engine.js'


function createMockGL () {
    const textures = []
    const framebuffers = []
    const programs = []
    const shaders = []
    const vaos = []
    const buffers = []

    return {
        VERTEX_SHADER: 0x8B31,
        FRAGMENT_SHADER: 0x8B30,
        COMPILE_STATUS: 0x8B81,
        LINK_STATUS: 0x8B82,
        ARRAY_BUFFER: 0x8892,
        STATIC_DRAW: 0x88E4,
        FLOAT: 0x1406,
        TRIANGLE_STRIP: 0x0005,
        TEXTURE_2D: 0x0DE1,
        TEXTURE0: 0x84C0,
        RGBA: 0x1908,
        RGBA8: 0x8058,
        UNSIGNED_BYTE: 0x1401,
        TEXTURE_MIN_FILTER: 0x2801,
        TEXTURE_MAG_FILTER: 0x2800,
        TEXTURE_WRAP_S: 0x2802,
        TEXTURE_WRAP_T: 0x2803,
        LINEAR: 0x2601,
        CLAMP_TO_EDGE: 0x812F,
        FRAMEBUFFER: 0x8D40,
        READ_FRAMEBUFFER: 0x8CA8,
        DRAW_FRAMEBUFFER: 0x8CA9,
        COLOR_ATTACHMENT0: 0x8CE0,
        COLOR_BUFFER_BIT: 0x4000,
        BLEND: 0x0BE2,
        ONE: 1,
        ZERO: 0,
        ONE_MINUS_SRC_ALPHA: 0x0303,

        createShader: vi.fn(() => {
            const shader = {id: shaders.length}
            shaders.push(shader)
            return shader
        }),
        shaderSource: vi.fn(),
        compileShader: vi.fn(),
        getShaderParameter: vi.fn(() => true),
        getShaderInfoLog: vi.fn(() => ''),
        deleteShader: vi.fn(),
        createProgram: vi.fn(() => {
            const program = {id: programs.length}
            programs.push(program)
            return program
        }),
        attachShader: vi.fn(),
        linkProgram: vi.fn(),
        getProgramParameter: vi.fn(() => true),
        getProgramInfoLog: vi.fn(() => ''),
        deleteProgram: vi.fn(),
        useProgram: vi.fn(),
        getUniformLocation: vi.fn((program, name) => ({program, name})),
        getAttribLocation: vi.fn(() => 0),
        uniform1f: vi.fn(),
        uniform2f: vi.fn(),
        uniform3f: vi.fn(),
        uniform4f: vi.fn(),
        uniform1i: vi.fn(),
        uniformMatrix3fv: vi.fn(),
        uniformMatrix4fv: vi.fn(),
        createVertexArray: vi.fn(() => {
            const vao = {id: vaos.length}
            vaos.push(vao)
            return vao
        }),
        bindVertexArray: vi.fn(),
        deleteVertexArray: vi.fn(),
        createBuffer: vi.fn(() => {
            const buffer = {id: buffers.length}
            buffers.push(buffer)
            return buffer
        }),
        bindBuffer: vi.fn(),
        bufferData: vi.fn(),
        enableVertexAttribArray: vi.fn(),
        vertexAttribPointer: vi.fn(),
        createTexture: vi.fn(() => {
            const texture = {id: textures.length}
            textures.push(texture)
            return texture
        }),
        bindTexture: vi.fn(),
        texImage2D: vi.fn(),
        texParameteri: vi.fn(),
        deleteTexture: vi.fn(),
        createFramebuffer: vi.fn(() => {
            const fbo = {id: framebuffers.length}
            framebuffers.push(fbo)
            return fbo
        }),
        bindFramebuffer: vi.fn(),
        framebufferTexture2D: vi.fn(),
        deleteFramebuffer: vi.fn(),
        clearColor: vi.fn(),
        clear: vi.fn(),
        viewport: vi.fn(),
        enable: vi.fn(),
        blendFunc: vi.fn(),
        drawArrays: vi.fn(),
        activeTexture: vi.fn(),
        blitFramebuffer: vi.fn()
    }
}


function createMockCanvas (gl) {
    return {
        width: 800,
        height: 600,
        style: {},
        getContext: vi.fn(() => gl)
    }
}


test('smoothPoint with zero smoothing returns current point', () => {
    const prev = {x: 0, y: 0, pressure: 0.5}
    const curr = {x: 10, y: 20, pressure: 1}
    const result = smoothPoint(prev, curr, 0)
    expect(result.x).toBeCloseTo(10)
    expect(result.y).toBeCloseTo(20)
    expect(result.pressure).toBeCloseTo(1)
})


test('smoothPoint with full smoothing stays at previous point', () => {
    const prev = {x: 0, y: 0, pressure: 0.5}
    const curr = {x: 10, y: 20, pressure: 1}
    const result = smoothPoint(prev, curr, 1)
    expect(result.x).toBeCloseTo(0)
    expect(result.y).toBeCloseTo(0)
    expect(result.pressure).toBeCloseTo(0.5)
})


test('smoothPoint with 0.5 smoothing averages positions', () => {
    const prev = {x: 0, y: 0, pressure: 0}
    const curr = {x: 10, y: 20, pressure: 1}
    const result = smoothPoint(prev, curr, 0.5)
    expect(result.x).toBeCloseTo(5)
    expect(result.y).toBeCloseTo(10)
    expect(result.pressure).toBeCloseTo(0.5)
})


test('interpolateStroke returns empty for zero distance', () => {
    const point = {x: 10, y: 10, pressure: 1}
    const result = interpolateStroke(point, point, 5)
    expect(result.stamps).toEqual([])
    expect(result.remainder).toBe(0)
})


test('interpolateStroke returns empty for zero step', () => {
    const from = {x: 0, y: 0, pressure: 1}
    const to = {x: 10, y: 0, pressure: 1}
    const result = interpolateStroke(from, to, 0)
    expect(result.stamps).toEqual([])
})


test('interpolateStroke places stamps at regular intervals', () => {
    const from = {x: 0, y: 0, pressure: 1}
    const to = {x: 30, y: 0, pressure: 1}
    const result = interpolateStroke(from, to, 10)
    expect(result.stamps).toHaveLength(3)
    expect(result.stamps[0].x).toBeCloseTo(10)
    expect(result.stamps[1].x).toBeCloseTo(20)
    expect(result.stamps[2].x).toBeCloseTo(30)
})


test('interpolateStroke returns empty when distance less than step', () => {
    const from = {x: 0, y: 0, pressure: 1}
    const to = {x: 3, y: 0, pressure: 1}
    const result = interpolateStroke(from, to, 10)
    expect(result.stamps).toEqual([])
    expect(result.remainder).toBeCloseTo(3)
})


test('interpolateStroke accumulates remainder across short segments', () => {
    const a = {x: 0, y: 0, pressure: 1}
    const b = {x: 3, y: 0, pressure: 1}
    const c = {x: 6, y: 0, pressure: 1}
    const d = {x: 12, y: 0, pressure: 1}

    const r1 = interpolateStroke(a, b, 10)
    expect(r1.stamps).toHaveLength(0)
    expect(r1.remainder).toBeCloseTo(3)

    const r2 = interpolateStroke(b, c, 10, r1.remainder)
    expect(r2.stamps).toHaveLength(0)
    expect(r2.remainder).toBeCloseTo(6)

    const r3 = interpolateStroke(c, d, 10, r2.remainder)
    expect(r3.stamps).toHaveLength(1)
    expect(r3.stamps[0].x).toBeCloseTo(10)
})


test('interpolateStroke uses remainder from previous segment', () => {
    const from = {x: 0, y: 0, pressure: 1}
    const to = {x: 7, y: 0, pressure: 1}
    const result = interpolateStroke(from, to, 10, 5)
    expect(result.stamps).toHaveLength(1)
    expect(result.stamps[0].x).toBeCloseTo(5)
})


test('interpolateStroke interpolates pressure', () => {
    const from = {x: 0, y: 0, pressure: 0}
    const to = {x: 20, y: 0, pressure: 1}
    const result = interpolateStroke(from, to, 10)
    expect(result.stamps[0].pressure).toBeCloseTo(0.5)
    expect(result.stamps[1].pressure).toBeCloseTo(1.0)
})


test('interpolateStroke handles diagonal strokes', () => {
    const from = {x: 0, y: 0, pressure: 1}
    const to = {x: 30, y: 40, pressure: 1}
    const result = interpolateStroke(from, to, 10)
    expect(result.stamps).toHaveLength(5)
})


test('interpolateStroke computes correct remainder', () => {
    const from = {x: 0, y: 0, pressure: 1}
    const to = {x: 25, y: 0, pressure: 1}
    const result = interpolateStroke(from, to, 10)
    expect(result.stamps).toHaveLength(2)
    expect(result.stamps[0].x).toBeCloseTo(10)
    expect(result.stamps[1].x).toBeCloseTo(20)
    expect(result.remainder).toBeCloseTo(5)
})


test('interpolateStroke preserves y coordinates', () => {
    const from = {x: 0, y: 5, pressure: 1}
    const to = {x: 20, y: 5, pressure: 1}
    const result = interpolateStroke(from, to, 10)
    expect(result.stamps[0].y).toBeCloseTo(5)
    expect(result.stamps[1].y).toBeCloseTo(5)
})


describe(PaintEngine, () => {

    let gl
    let canvas
    let engine

    beforeEach(() => {
        gl = createMockGL()
        canvas = createMockCanvas(gl)
        engine = new PaintEngine(canvas)
    })


    test('constructor initializes with default layer', () => {
        expect(engine.layerCount).toBe(1)
        expect(engine.activeLayerIndex).toBe(0)
    })


    test('gl getter returns the WebGL context', () => {
        expect(engine.gl).toBe(gl)
    })


    test('brush getter returns brush copy', () => {
        const brush = engine.brush
        expect(brush.size).toBe(20)
        expect(brush.hardness).toBe(0.8)
        expect(brush.opacity).toBe(1.0)
        expect(brush.flow).toBe(0.8)
        expect(brush.eraser).toBe(false)
        expect(brush.smudge).toBe(false)
    })


    test('setBrush updates brush parameters', () => {
        engine.setBrush({size: 50, hardness: 0.5})
        const brush = engine.brush
        expect(brush.size).toBe(50)
        expect(brush.hardness).toBe(0.5)
        expect(brush.opacity).toBe(1.0)
    })


    test('setBrush can enable eraser', () => {
        engine.setBrush({eraser: true})
        expect(engine.brush.eraser).toBe(true)
    })


    test('setBrush can enable smudge', () => {
        engine.setBrush({smudge: true})
        expect(engine.brush.smudge).toBe(true)
    })


    test('getLayerInfo returns layer data', () => {
        const info = engine.getLayerInfo(0)
        expect(info.name).toBe('Layer 1')
        expect(info.opacity).toBe(1.0)
        expect(info.visible).toBe(true)
    })


    test('getLayerInfo returns null for invalid index', () => {
        expect(engine.getLayerInfo(-1)).toBeNull()
        expect(engine.getLayerInfo(99)).toBeNull()
    })


    test('addLayer creates a new layer', () => {
        const index = engine.addLayer()
        expect(index).toBe(1)
        expect(engine.layerCount).toBe(2)
        const info = engine.getLayerInfo(1)
        expect(info.name).toBe('Layer 2')
    })


    test('addLayer calls composite', () => {
        const compositeSpy = vi.spyOn(engine, 'composite')
        engine.addLayer()
        expect(compositeSpy).toHaveBeenCalled()
    })


    test('removeLayer deletes layer', () => {
        engine.addLayer()
        expect(engine.layerCount).toBe(2)
        engine.removeLayer(1)
        expect(engine.layerCount).toBe(1)
    })


    test('removeLayer does nothing when only one layer', () => {
        engine.removeLayer(0)
        expect(engine.layerCount).toBe(1)
    })


    test('removeLayer does nothing for invalid index', () => {
        engine.addLayer()
        engine.removeLayer(99)
        expect(engine.layerCount).toBe(2)
    })


    test('removeLayer adjusts activeLayerIndex if needed', () => {
        engine.addLayer()
        engine.activeLayerIndex = 1
        engine.removeLayer(1)
        expect(engine.activeLayerIndex).toBe(0)
    })


    test('moveLayer reorders layers', () => {
        engine.addLayer()
        engine.addLayer()
        engine.setLayerName(0, 'A')
        engine.setLayerName(1, 'B')
        engine.setLayerName(2, 'C')

        engine.moveLayer(0, 2)
        expect(engine.getLayerInfo(2).name).toBe('A')
    })


    test('moveLayer updates activeLayerIndex when moving active layer', () => {
        engine.addLayer()
        engine.activeLayerIndex = 0
        engine.moveLayer(0, 1)
        expect(engine.activeLayerIndex).toBe(1)
    })


    test('moveLayer ignores invalid fromIndex', () => {
        engine.addLayer()
        engine.moveLayer(-1, 0)
        engine.moveLayer(99, 0)
        expect(engine.layerCount).toBe(2)
    })


    test('moveLayer ignores invalid toIndex', () => {
        engine.addLayer()
        engine.moveLayer(0, -1)
        engine.moveLayer(0, 99)
        expect(engine.layerCount).toBe(2)
    })


    test('setLayerOpacity updates layer opacity', () => {
        engine.setLayerOpacity(0, 0.5)
        expect(engine.getLayerInfo(0).opacity).toBe(0.5)
    })


    test('setLayerOpacity ignores invalid index', () => {
        engine.setLayerOpacity(99, 0.5)
        expect(engine.getLayerInfo(0).opacity).toBe(1.0)
    })


    test('setLayerVisible updates layer visibility', () => {
        engine.setLayerVisible(0, false)
        expect(engine.getLayerInfo(0).visible).toBe(false)
    })


    test('setLayerVisible ignores invalid index', () => {
        engine.setLayerVisible(99, false)
        expect(engine.getLayerInfo(0).visible).toBe(true)
    })


    test('setLayerName updates layer name', () => {
        engine.setLayerName(0, 'Background')
        expect(engine.getLayerInfo(0).name).toBe('Background')
    })


    test('setLayerName ignores invalid index', () => {
        engine.setLayerName(99, 'Test')
        expect(engine.getLayerInfo(0).name).toBe('Layer 1')
    })


    test('activeLayerIndex setter validates bounds', () => {
        engine.addLayer()
        engine.activeLayerIndex = 1
        expect(engine.activeLayerIndex).toBe(1)
        engine.activeLayerIndex = -1
        expect(engine.activeLayerIndex).toBe(1)
        engine.activeLayerIndex = 99
        expect(engine.activeLayerIndex).toBe(1)
    })


    test('beginStroke initializes stroke state', () => {
        engine.beginStroke(100, 200, 0.8)
        expect(gl.drawArrays).toHaveBeenCalled()
    })


    test('beginStroke with smudge brush initializes snapshot', () => {
        engine.setBrush({smudge: true})
        engine.beginStroke(100, 200, 0.8)
        expect(gl.blitFramebuffer).toHaveBeenCalled()
    })


    test('continueStroke does nothing before beginStroke', () => {
        gl.drawArrays.mockClear()
        engine.continueStroke(150, 250, 0.8)
        expect(gl.drawArrays).not.toHaveBeenCalled()
    })


    test('continueStroke draws stamps along path', () => {
        engine.beginStroke(0, 0, 1)
        gl.drawArrays.mockClear()
        engine.continueStroke(100, 0, 1)
        expect(gl.drawArrays).toHaveBeenCalled()
    })


    test('endStroke resets stroke state', () => {
        engine.beginStroke(100, 200, 0.8)
        engine.endStroke()
        gl.drawArrays.mockClear()
        engine.continueStroke(150, 250, 0.8)
        expect(gl.drawArrays).not.toHaveBeenCalled()
    })


    test('clear clears the active layer', () => {
        engine.clear()
        expect(gl.clear).toHaveBeenCalled()
    })


    test('composite renders all visible layers', () => {
        engine.addLayer()
        gl.drawArrays.mockClear()
        engine.composite()
        expect(gl.drawArrays).toHaveBeenCalledTimes(2)
    })


    test('composite skips hidden layers', () => {
        engine.addLayer()
        engine.setLayerVisible(0, false)
        gl.drawArrays.mockClear()
        engine.composite()
        expect(gl.drawArrays).toHaveBeenCalledTimes(1)
    })


    test('resize updates canvas dimensions', () => {
        engine.resize(1920, 1080)
        expect(gl.viewport).toHaveBeenCalled()
        expect(canvas.style.width).toBe('1920px')
        expect(canvas.style.height).toBe('1080px')
    })


    test('resize regenerates layer textures', () => {
        const initialTexImage2DCount = gl.texImage2D.mock.calls.length
        engine.resize(1920, 1080)
        expect(gl.texImage2D.mock.calls.length).toBeGreaterThan(initialTexImage2DCount)
    })


    test('dispose cleans up WebGL resources', () => {
        engine.addLayer()
        engine.dispose()
        expect(gl.deleteFramebuffer).toHaveBeenCalled()
        expect(gl.deleteTexture).toHaveBeenCalled()
        expect(gl.deleteProgram).toHaveBeenCalled()
        expect(gl.deleteVertexArray).toHaveBeenCalled()
        expect(engine.gl).toBeNull()
    })


    test('dispose handles smudge snapshot if present', () => {
        engine.setBrush({smudge: true})
        engine.beginStroke(100, 200, 0.8)
        const deleteCount = gl.deleteFramebuffer.mock.calls.length
        engine.dispose()
        expect(gl.deleteFramebuffer.mock.calls.length).toBeGreaterThan(deleteCount)
    })

})
