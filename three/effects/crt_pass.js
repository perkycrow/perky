import {ShaderPass} from 'three/addons/postprocessing/ShaderPass'

const CRTShader = {
    uniforms: {
        tDiffuse: {value: null},
        scanlineIntensity: {value: 0.04},
        scanlineCount: {value: 800.0},
        curvature: {value: 0.15},
        screenCurvature: {value: 0.1},
        vignetteIntensity: {value: 0.3},
        brightness: {value: 1.02},
        flickerIntensity: {value: 0.005},
        time: {value: 0.0}
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
        uniform float scanlineIntensity;
        uniform float scanlineCount;
        uniform float curvature;
        uniform float screenCurvature;
        uniform float vignetteIntensity;
        uniform float brightness;
        uniform float flickerIntensity;
        uniform float time;

        varying vec2 vUv;

        // Apply barrel distortion to simulate CRT screen curvature
        vec2 applyCurvature(vec2 uv) {
            uv = uv * 2.0 - 1.0; // Convert to -1 to 1 range
            
            // Apply barrel distortion
            float r2 = dot(uv, uv);
            float distortion = 1.0 + screenCurvature * r2;
            uv *= distortion;
            
            uv = uv * 0.5 + 0.5; // Convert back to 0 to 1 range
            return uv;
        }

        // Generate scanlines effect
        float scanlines(vec2 uv) {
            float line = sin(uv.y * scanlineCount);
            line = pow(line, 2.0);
            return 1.0 - (line * scanlineIntensity);
        }

        // Apply screen edge vignette
        float screenVignette(vec2 uv) {
            uv *= 1.0 - uv.yx;
            float vig = uv.x * uv.y * 15.0;
            vig = pow(vig, vignetteIntensity);
            return vig;
        }

        // Screen bounds check
        bool isInBounds(vec2 uv) {
            return uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0;
        }

        void main() {
            vec2 uv = vUv;
            
            // Apply CRT curvature
            vec2 curvedUv = applyCurvature(uv);
            
            // Check if we're still within screen bounds after curvature
            if (!isInBounds(curvedUv)) {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black outside screen
                return;
            }
            
            // Sample the texture with curved coordinates
            vec4 texelColor = texture2D(tDiffuse, curvedUv);
            
            // Apply scanlines
            float scanlineFactor = scanlines(curvedUv);
            texelColor.rgb *= scanlineFactor;
            
            // Apply screen vignette
            float vignette = screenVignette(curvedUv);
            texelColor.rgb *= vignette;
            
            // Apply brightness
            texelColor.rgb *= brightness;
            
            // Add subtle flicker effect
            float flicker = 1.0 + sin(time * 60.0) * flickerIntensity;
            texelColor.rgb *= flicker;
            
            // Slight color shift for authenticity
            texelColor.r *= 1.02;
            texelColor.g *= 0.99;
            texelColor.b *= 0.98;
            
            gl_FragColor = texelColor;
        }
    `
}

export default class CRTPass extends ShaderPass {
    constructor () {
        super(CRTShader)
        
        this.scanlineIntensity = this.uniforms.scanlineIntensity.value
        this.scanlineCount = this.uniforms.scanlineCount.value
        this.curvature = this.uniforms.curvature.value
        this.screenCurvature = this.uniforms.screenCurvature.value
        this.vignetteIntensity = this.uniforms.vignetteIntensity.value
        this.brightness = this.uniforms.brightness.value
        this.flickerIntensity = this.uniforms.flickerIntensity.value
        
        this.time = 0
    }

    update (deltaTime) {
        this.time += deltaTime
        this.uniforms.time.value = this.time
    }

    setScanlineIntensity (value) {
        this.scanlineIntensity = value
        this.uniforms.scanlineIntensity.value = value
    }

    setScanlineCount (value) {
        this.scanlineCount = value
        this.uniforms.scanlineCount.value = value
    }

    setCurvature (value) {
        this.curvature = value
        this.uniforms.curvature.value = value
    }

    setScreenCurvature (value) {
        this.screenCurvature = value
        this.uniforms.screenCurvature.value = value
    }

    setVignetteIntensity (value) {
        this.vignetteIntensity = value
        this.uniforms.vignetteIntensity.value = value
    }

    setBrightness (value) {
        this.brightness = value
        this.uniforms.brightness.value = value
    }

    setFlickerIntensity (value) {
        this.flickerIntensity = value
        this.uniforms.flickerIntensity.value = value
    }
} 