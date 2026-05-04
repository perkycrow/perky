import {vi} from 'vitest'


const GL_CONSTANTS = {
    BLEND: 1,
    SRC_ALPHA: 1,
    ONE_MINUS_SRC_ALPHA: 1,
    TEXTURE_2D: 1,
    TEXTURE0: 1,
    TEXTURE1: 2,
    RGBA: 1,
    UNSIGNED_BYTE: 1,
    LINEAR: 1,
    LINEAR_MIPMAP_LINEAR: 1,
    CLAMP_TO_EDGE: 1,
    REPEAT: 0x2901,
    TEXTURE_MIN_FILTER: 1,
    TEXTURE_MAG_FILTER: 1,
    TEXTURE_WRAP_S: 1,
    TEXTURE_WRAP_T: 1,
    FRAMEBUFFER: 1,
    COLOR_ATTACHMENT0: 1,
    COLOR_BUFFER_BIT: 1,
    VERTEX_SHADER: 1,
    FRAGMENT_SHADER: 1,
    ARRAY_BUFFER: 1,
    ELEMENT_ARRAY_BUFFER: 1,
    FLOAT: 1,
    UNSIGNED_SHORT: 1,
    TRIANGLES: 1,
    TRIANGLE_FAN: 1,
    TRIANGLE_STRIP: 1,
    LINES: 1,
    DYNAMIC_DRAW: 1,
    STATIC_DRAW: 1,
    COMPILE_STATUS: 1,
    LINK_STATUS: 1,
    FRAMEBUFFER_COMPLETE: 36053,
    RENDERBUFFER: 1,
    RGBA8: 1,
    READ_FRAMEBUFFER: 1,
    DRAW_FRAMEBUFFER: 1,
    MAX_SAMPLES: 0x8d57,
    NEAREST: 1
}


function getParameterImpl (param) {
    if (param === 0x8d57) {
        return 4
    }
    return 4
}


function createGLMethods (useSpy) {
    const fn = useSpy ? vi.fn : () => () => {}
    const fnWith = useSpy
        ? (impl) => vi.fn(impl)
        : (impl) => impl

    return {
        enable: fn(),
        disable: fn(),
        blendFunc: fn(),
        viewport: fn(),
        clearColor: fn(),
        clear: fn(),
        createBuffer: fnWith(() => ({})),
        createTexture: fnWith(() => ({})),
        createProgram: fnWith(() => ({})),
        createShader: fnWith(() => ({})),
        shaderSource: fn(),
        compileShader: fn(),
        getShaderParameter: fnWith(() => true),
        getShaderInfoLog: fnWith(() => ''),
        attachShader: fn(),
        linkProgram: fn(),
        getProgramParameter: fnWith(() => true),
        getProgramInfoLog: fnWith(() => ''),
        deleteShader: fn(),
        useProgram: fn(),
        getUniformLocation: fnWith(() => ({})),
        getAttribLocation: fnWith(() => 0),
        bindBuffer: fn(),
        bufferData: fn(),
        enableVertexAttribArray: fn(),
        disableVertexAttribArray: fn(),
        vertexAttribPointer: fn(),
        uniformMatrix3fv: fn(),
        uniform1i: fn(),
        uniform1f: fn(),
        uniform2f: fn(),
        uniform3f: fn(),
        uniform4f: fn(),
        uniformMatrix4fv: fn(),
        drawArrays: fn(),
        drawElements: fn(),
        deleteBuffer: fn(),
        deleteProgram: fn(),
        deleteTexture: fn(),
        bindTexture: fn(),
        texImage2D: fn(),
        texParameteri: fn(),
        generateMipmap: fn(),
        activeTexture: fn(),
        createFramebuffer: fnWith(() => ({})),
        bindFramebuffer: fn(),
        framebufferTexture2D: fn(),
        framebufferRenderbuffer: fn(),
        checkFramebufferStatus: fnWith(() => 36053),
        deleteFramebuffer: fn(),
        depthMask: fn(),
        lineWidth: fn(),
        createRenderbuffer: fnWith(() => ({})),
        bindRenderbuffer: fn(),
        renderbufferStorageMultisample: fn(),
        deleteRenderbuffer: fn(),
        blitFramebuffer: fn(),
        getExtension: fnWith(() => null),
        getParameter: fnWith(getParameterImpl)
    }
}


export function createMockGL () {
    return {
        ...createGLMethods(false),
        ...GL_CONSTANTS
    }
}


export function createMockGLWithSpies () {
    return {
        ...createGLMethods(true),
        ...GL_CONSTANTS
    }
}


export function createMockImage (width = 100, height = 100, {complete = true} = {}) {
    return {
        width,
        height,
        complete,
        naturalWidth: complete ? width : 0,
        naturalHeight: complete ? height : 0
    }
}


export function createMockCanvas (width = 800, height = 600) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return canvas
}


export function createMockProgram ({hasTexCoord = true} = {}) {
    return {
        use: vi.fn(),
        setUniform1i: vi.fn(),
        setUniform1f: vi.fn(),
        setUniform2f: vi.fn(),
        setUniform3f: vi.fn(),
        setUniform4f: vi.fn(),
        attributes: {
            aPosition: 0,
            aTexCoord: hasTexCoord ? 1 : undefined
        }
    }
}


export function createMockShaderRegistry (program = null) {
    const defaultProgram = program || createMockProgram()
    return {
        register: vi.fn(() => defaultProgram)
    }
}


export function createMockQuad () {
    return {
        draw: vi.fn()
    }
}
