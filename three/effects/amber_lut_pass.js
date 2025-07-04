import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js'
import {Vector3} from 'three'

const AmberLUTShader = {
    uniforms: {
        tDiffuse: {value: null},
        intensity: {value: 0.3},
        amberTint: {value: new Vector3(1.0, 0.8, 0.4)},
        contrast: {value: 1.1},
        brightness: {value: 0.05},
        vintage: {value: 0.2}
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
        uniform vec3 amberTint;
        uniform float contrast;
        uniform float brightness;
        uniform float vintage;

        varying vec2 vUv;

        // Fonction pour appliquer l'effet "vieux moniteur"
        vec3 applyAmberLUT(vec3 color) {
            // Conversion en luminance
            float luma = dot(color, vec3(0.299, 0.587, 0.114));
            
            // Application de la teinte ambre
            vec3 tinted = mix(color, color * amberTint, intensity);
            
            // Ajustement du contraste
            tinted = (tinted - 0.5) * contrast + 0.5 + brightness;
            
            // Effet vintage (désaturation partielle)
            vec3 gray = vec3(luma);
            tinted = mix(tinted, gray * amberTint, vintage * intensity);
            
            // Léger effet de grain/scanlines
            float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453) * 0.1;
            tinted += noise * intensity * 0.05;
            
            return tinted;
        }

        void main() {
            vec4 texelColor = texture2D(tDiffuse, vUv);
            
            vec3 processedColor = applyAmberLUT(texelColor.rgb);
            
            // Mix entre l'original et le traité
            vec3 finalColor = mix(texelColor.rgb, processedColor, intensity);
            
            gl_FragColor = vec4(finalColor, texelColor.a);
        }
    `
}

export default class AmberLUTPass extends ShaderPass {
    constructor () {
        super(AmberLUTShader)
        
        this.intensity = this.uniforms.intensity.value
        this.amberTint = this.uniforms.amberTint.value
        this.contrast = this.uniforms.contrast.value
        this.brightness = this.uniforms.brightness.value
        this.vintage = this.uniforms.vintage.value
    }

    setIntensity (value) {
        this.intensity = value
        this.uniforms.intensity.value = value
    }

    setAmberTint (r, g, b) {
        this.amberTint.set(r, g, b)
        this.uniforms.amberTint.value = this.amberTint
    }

    setContrast (value) {
        this.contrast = value
        this.uniforms.contrast.value = value
    }

    setBrightness (value) {
        this.brightness = value
        this.uniforms.brightness.value = value
    }

    setVintage (value) {
        this.vintage = value
        this.uniforms.vintage.value = value
    }
} 