// Vertex shader pour les sprites avec support Y-up natif
const SPRITE_VERTEX_SHADER = `
attribute vec2 aPosition;
attribute vec2 aTexCoord;
attribute float aOpacity;

uniform mat3 uProjectionMatrix;
uniform mat3 uViewMatrix;
uniform mat3 uModelMatrix;

varying vec2 vTexCoord;
varying float vOpacity;

void main() {
    // Combine toutes les transformations
    vec3 worldPos = uModelMatrix * vec3(aPosition, 1.0);
    vec3 viewPos = uViewMatrix * worldPos;
    vec3 clipPos = uProjectionMatrix * viewPos;
    
    gl_Position = vec4(clipPos.xy, 0.0, 1.0);
    vTexCoord = aTexCoord;
    vOpacity = aOpacity;
}
`


const SPRITE_FRAGMENT_SHADER = `
precision mediump float;

uniform sampler2D uTexture;
varying vec2 vTexCoord;
varying float vOpacity;

void main() {
    vec4 texColor = texture2D(uTexture, vTexCoord);
    gl_FragColor = vec4(texColor.rgb, texColor.a * vOpacity);
}
`


const PRIMITIVE_VERTEX_SHADER = `
attribute vec2 aPosition;
attribute vec4 aColor;

uniform mat3 uProjectionMatrix;
uniform mat3 uViewMatrix;

varying vec4 vColor;

void main() {
    vec3 viewPos = uViewMatrix * vec3(aPosition, 1.0);
    vec3 clipPos = uProjectionMatrix * viewPos;
    
    gl_Position = vec4(clipPos.xy, 0.0, 1.0);
    vColor = aColor;
}
`


const PRIMITIVE_FRAGMENT_SHADER = `
precision mediump float;

varying vec4 vColor;

void main() {
    gl_FragColor = vColor;
}
`


function compileShader (gl, source, type) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader)
        gl.deleteShader(shader)
        throw new Error(`Shader compilation failed: ${info}`)
    }

    return shader
}


function createProgram (gl, vertexSource, fragmentSource) {
    const vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER)
    const fragmentShader = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER)

    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program)
        gl.deleteProgram(program)
        throw new Error(`Program linking failed: ${info}`)
    }

    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)

    return program
}


export function createSpriteProgram (gl) {
    const program = createProgram(gl, SPRITE_VERTEX_SHADER, SPRITE_FRAGMENT_SHADER)

    return {
        program,
        attributes: {
            position: gl.getAttribLocation(program, 'aPosition'),
            texCoord: gl.getAttribLocation(program, 'aTexCoord'),
            opacity: gl.getAttribLocation(program, 'aOpacity')
        },
        uniforms: {
            projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
            viewMatrix: gl.getUniformLocation(program, 'uViewMatrix'),
            modelMatrix: gl.getUniformLocation(program, 'uModelMatrix'),
            texture: gl.getUniformLocation(program, 'uTexture')
        }
    }
}


export function createPrimitiveProgram (gl) {
    const program = createProgram(gl, PRIMITIVE_VERTEX_SHADER, PRIMITIVE_FRAGMENT_SHADER)

    return {
        program,
        attributes: {
            position: gl.getAttribLocation(program, 'aPosition'),
            color: gl.getAttribLocation(program, 'aColor')
        },
        uniforms: {
            projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
            viewMatrix: gl.getUniformLocation(program, 'uViewMatrix')
        }
    }
}
