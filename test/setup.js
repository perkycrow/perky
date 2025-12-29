
global.ResizeObserver = class ResizeObserver {
    constructor (callback) {
        this.callback = callback
    }

    observe () { } // eslint-disable-line class-methods-use-this

    unobserve () { } // eslint-disable-line class-methods-use-this

    disconnect () { } // eslint-disable-line class-methods-use-this
}


// Mock WebGL context for tests
global.createMockWebGLContext = () => ({
    enable: () => { },
    disable: () => { },
    blendFunc: () => { },
    viewport: () => { },
    clearColor: () => { },
    clear: () => { },
    createBuffer: () => ({}),
    createTexture: () => ({}),
    createProgram: () => ({}),
    createShader: () => ({}),
    shaderSource: () => { },
    compileShader: () => { },
    getShaderParameter: () => true,
    getShaderInfoLog: () => '',
    attachShader: () => { },
    linkProgram: () => { },
    getProgramParameter: () => true,
    getProgramInfoLog: () => '',
    deleteShader: () => { },
    useProgram: () => { },
    getUniformLocation: () => ({}),
    getAttribLocation: () => 0,
    bindBuffer: () => { },
    bufferData: () => { },
    enableVertexAttribArray: () => { },
    disableVertexAttribArray: () => { },
    vertexAttribPointer: () => { },
    uniformMatrix3fv: () => { },
    uniform1i: () => { },
    uniform1f: () => { },
    uniform2f: () => { },
    drawArrays: () => { },
    drawElements: () => { },
    deleteBuffer: () => { },
    deleteProgram: () => { },
    deleteTexture: () => { },
    bindTexture: () => { },
    texImage2D: () => { },
    texParameteri: () => { },
    activeTexture: () => { },
    createFramebuffer: () => ({}),
    bindFramebuffer: () => { },
    framebufferTexture2D: () => { },
    checkFramebufferStatus: () => 36053,
    deleteFramebuffer: () => { },
    lineWidth: () => { },

    // WebGL constants
    BLEND: 1,
    SRC_ALPHA: 1,
    ONE_MINUS_SRC_ALPHA: 1,
    TEXTURE_2D: 1,
    TEXTURE0: 1,
    RGBA: 1,
    UNSIGNED_BYTE: 1,
    LINEAR: 1,
    CLAMP_TO_EDGE: 1,
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
    LINES: 1,
    DYNAMIC_DRAW: 1,
    STATIC_DRAW: 1,
    COMPILE_STATUS: 1,
    LINK_STATUS: 1,
    FRAMEBUFFER_COMPLETE: 36053
})


// Override HTMLCanvasElement.getContext to return mock WebGL
const originalGetContext = HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = function (type, options) {
    if (type === 'webgl' || type === 'webgl2') {
        return global.createMockWebGLContext()
    }
    return originalGetContext.call(this, type, options)
}
