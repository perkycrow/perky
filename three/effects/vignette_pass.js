import {ShaderPass} from 'three/addons/postprocessing/ShaderPass'

const VignetteShader = {
    uniforms: {
        tDiffuse: {value: null},
        intensity: {value: 0.6},
        dropoff: {value: 0.25}
    },

    vertexShader: `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float intensity;
        uniform float dropoff;

        varying vec2 vUv;

        float vignette(vec2 uvs) {
            float v1 = smoothstep(0.5, 0.3, abs(uvs.x - 0.5));
            float v2 = smoothstep(0.5, 0.3, abs(uvs.y - 0.5));
            float v = v1 * v2;
            v = pow(v, dropoff);
            v = v * intensity + (1.0 - intensity);
            return v;
        }

        void main() {
            vec4 texelColor = texture2D(tDiffuse, vUv);
            float darkening = vignette(vUv);
            
            gl_FragColor = vec4(texelColor.rgb * darkening, texelColor.a);
        }
    `
}

export default class VignettePass extends ShaderPass {
    constructor () {
        super(VignetteShader)
        
        this.intensity = this.uniforms.intensity.value
        this.dropoff = this.uniforms.dropoff.value
    }

    setIntensity (value) {
        this.intensity = value
        this.uniforms.intensity.value = value
    }

    setDropoff (value) {
        this.dropoff = value
        this.uniforms.dropoff.value = value
    }
} 