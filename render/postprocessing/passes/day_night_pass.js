import RenderPass from '../render_pass.js'


export default class DayNightPass extends RenderPass {

    static shaderDefinition = {
        vertex: `#version 300 es
            in vec2 aPosition;
            in vec2 aTexCoord;
            out vec2 vTexCoord;
            void main() {
                gl_Position = vec4(aPosition, 0.0, 1.0);
                vTexCoord = aTexCoord;
            }
        `,
        fragment: `#version 300 es
            precision mediump float;
            uniform sampler2D uTexture;
            uniform float uDarkness;
            uniform float uTintStrength;
            uniform vec3 uTintColor;
            uniform float uStarsIntensity;
            uniform float uStarsThreshold;
            uniform float uTime;
            in vec2 vTexCoord;
            out vec4 fragColor;

            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }

            void main() {
                vec4 color = texture(uTexture, vTexCoord);

                float blueness = color.b - max(color.r, color.g);
                float skyFactor = smoothstep(-0.08, 0.15, blueness);
                float skyDarkening = min(uDarkness + skyFactor * 0.35, 0.85);

                vec3 rgb = color.rgb * (1.0 - skyDarkening);

                rgb = mix(rgb, rgb * uTintColor, uTintStrength);

                float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));

                if (blueness > 0.0 && uStarsIntensity > 0.0) {
                    vec2 gridSize = vec2(100.0, 60.0);
                    vec2 starOffset = vec2(uTime * 0.02, 0.0);
                    vec2 starCoord = floor((vTexCoord + starOffset) * gridSize);
                    float starRand = random(starCoord);

                    if (starRand > 0.92) {
                        vec2 cellUV = fract((vTexCoord + starOffset) * gridSize);
                        vec2 starPos = vec2(random(starCoord + 0.1), random(starCoord + 0.2));
                        float dist = length(cellUV - starPos);

                        float starSize = 0.08 + random(starCoord + 0.3) * 0.08;
                        float star = smoothstep(starSize, 0.0, dist);

                        float twinkle = sin(uTime * (1.5 + starRand * 2.0) + starRand * 6.28) * 0.3 + 0.7;
                        float skyBlend = (luminance - uStarsThreshold) / (1.0 - uStarsThreshold);
                        float starBrightness = uStarsIntensity * star * twinkle * skyBlend;
                        rgb += vec3(starBrightness);
                    }
                }

                fragColor = vec4(clamp(rgb, 0.0, 1.0), color.a);
            }
        `,
        uniforms: ['uTexture', 'uDarkness', 'uTintStrength', 'uTintColor', 'uStarsIntensity', 'uStarsThreshold', 'uTime'],
        attributes: ['aPosition', 'aTexCoord']
    }

    static defaultUniforms = {
        uDarkness: 0.0,
        uTintStrength: 0.0,
        uTintColor: [0.4, 0.5, 0.8],
        uStarsIntensity: 0.0,
        uStarsThreshold: 0.5,
        uTime: 0.0
    }

    static uniformConfig = {
        uDarkness: {min: 0, max: 1, step: 0.01},
        uTintStrength: {min: 0, max: 1, step: 0.01},
        uTintColor: {type: 'color'},
        uStarsIntensity: {min: 0, max: 1, step: 0.01},
        uStarsThreshold: {min: 0, max: 1, step: 0.01},
        uTime: {min: 0, max: 100, step: 0.1}
    }


    static phases = {
        night: {
            darkness: 0.4,
            tintStrength: 0.5,
            tintColor: [0.4, 0.5, 0.8],
            starsIntensity: 1.2
        },
        dawn: {
            darkness: 0.15,
            tintStrength: 0.4,
            tintColor: [1.0, 0.6, 0.5],
            starsIntensity: 0.0
        },
        day: {
            darkness: 0.0,
            tintStrength: 0.0,
            tintColor: [1.0, 1.0, 1.0],
            starsIntensity: 0.0
        },
        dusk: {
            darkness: 0.2,
            tintStrength: 0.35,
            tintColor: [1.0, 0.5, 0.4],
            starsIntensity: 0.0
        }
    }


    setTimeOfDay(t) {
        const time = ((t % 1) + 1) % 1

        let fromPhase, toPhase, blend

        if (time < 0.33) {
            fromPhase = DayNightPass.phases.dawn
            toPhase = DayNightPass.phases.day
            blend = time / 0.33
        } else if (time < 0.66) {
            fromPhase = DayNightPass.phases.day
            toPhase = DayNightPass.phases.night
            blend = (time - 0.33) / 0.33
        } else {
            fromPhase = DayNightPass.phases.night
            toPhase = DayNightPass.phases.dawn
            blend = (time - 0.66) / 0.34
        }

        const smoothBlend = blend * blend * (3 - 2 * blend)

        const lerp = (a, b, t) => a + (b - a) * t
        const lerpColor = (a, b, t) => [
            lerp(a[0], b[0], t),
            lerp(a[1], b[1], t),
            lerp(a[2], b[2], t)
        ]

        this.setUniform('uDarkness', lerp(fromPhase.darkness, toPhase.darkness, smoothBlend))
        this.setUniform('uTintStrength', lerp(fromPhase.tintStrength, toPhase.tintStrength, smoothBlend))
        this.setUniform('uTintColor', lerpColor(fromPhase.tintColor, toPhase.tintColor, smoothBlend))
        this.setUniform('uStarsIntensity', lerp(fromPhase.starsIntensity, toPhase.starsIntensity, smoothBlend))
    }


    setDawn() {
        this.setTimeOfDay(0.0)
    }


    setDay() {
        this.setTimeOfDay(0.33)
    }


    setNight() {
        this.setTimeOfDay(0.66)
    }

}
