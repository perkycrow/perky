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
            uniform float uSunPosition;
            uniform float uAspectRatio;
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

                // Dynamic golden hour tint based on sun height
                if (blueness > 0.0 && uSunPosition > -0.2 && uSunPosition < 1.2) {
                    float sunX = uSunPosition;
                    float sunY = 1.0 - 4.0 * (sunX - 0.5) * (sunX - 0.5);
                    sunY = sunY * 0.45 + 0.50;

                    float goldenHourFactor = 1.0 - smoothstep(0.85, 0.93, sunY);
                    vec3 goldenTint = mix(vec3(1.0, 1.0, 1.0), vec3(1.0, 0.75, 0.55), goldenHourFactor * 0.4);
                    rgb = rgb * goldenTint;
                }

                if (blueness > 0.0 && uSunPosition > -0.2 && uSunPosition < 1.2) {
                    float sunX = uSunPosition;
                    float sunY = 1.0 - 4.0 * (sunX - 0.5) * (sunX - 0.5);
                    sunY = sunY * 0.45 + 0.50;
                    vec2 sunPos = vec2(sunX, sunY);

                    vec2 diff = vTexCoord - sunPos;
                    diff.x *= uAspectRatio;
                    float distToSun = length(diff);

                    float sunDisc = smoothstep(0.03, 0.025, distToSun);
                    float sunRing = smoothstep(0.038, 0.033, distToSun) - smoothstep(0.03, 0.025, distToSun);
                    float sunHalo = smoothstep(0.08, 0.03, distToSun) * 0.25;

                    float horizonFactor = 1.0 - smoothstep(0.85, 0.95, sunY);
                    vec3 sunColor = mix(vec3(1.0, 0.95, 0.8), vec3(1.0, 0.4, 0.15), horizonFactor);
                    vec3 ringColor = mix(vec3(1.0, 0.9, 0.6), vec3(1.0, 0.5, 0.2), horizonFactor);

                    rgb += sunColor * sunDisc * skyFactor;
                    rgb += ringColor * sunRing * 0.6 * skyFactor;
                    rgb += sunColor * sunHalo * skyFactor;
                }

                if (blueness > 0.0 && uStarsIntensity > 0.0) {
                    vec2 gridSize = vec2(100.0, 60.0);
                    vec2 starOffset = vec2(uTime * 0.015, uTime * 0.008);
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
        uniforms: ['uTexture', 'uDarkness', 'uTintStrength', 'uTintColor', 'uStarsIntensity', 'uStarsThreshold', 'uTime', 'uSunPosition', 'uAspectRatio'],
        attributes: ['aPosition', 'aTexCoord']
    }

    static defaultUniforms = {
        uDarkness: 0.0,
        uTintStrength: 0.0,
        uTintColor: [0.4, 0.5, 0.8],
        uStarsIntensity: 0.0,
        uStarsThreshold: 0.5,
        uTime: 0.0,
        uSunPosition: -1.0,
        uAspectRatio: 1.0
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
            starsIntensity: 1.2,
            sunPosition: -0.5
        },
        dawn: {
            darkness: 0.08,
            tintStrength: 0.5,
            tintColor: [1.0, 0.65, 0.45],
            starsIntensity: 0.0,
            sunPosition: 0.15
        },
        day: {
            darkness: 0.0,
            tintStrength: 0.0,
            tintColor: [1.0, 1.0, 1.0],
            starsIntensity: 0.0,
            sunPosition: 0.5
        },
        dusk: {
            darkness: 0.35,
            tintStrength: 0.55,
            tintColor: [1.0, 0.35, 0.25],
            starsIntensity: 0.0,
            sunPosition: 0.85
        }
    }

    setTimeOfDay (t) {
        const cycleOffset = -0.0625
        const time = (((t + cycleOffset) % 1) + 1) % 1

        let fromPhase
        let toPhase
        let blend

        if (time < 0.25) {
            fromPhase = DayNightPass.phases.dawn
            toPhase = DayNightPass.phases.day
            blend = time / 0.25
        } else if (time < 0.5) {
            fromPhase = DayNightPass.phases.day
            toPhase = DayNightPass.phases.dusk
            blend = (time - 0.25) / 0.25
        } else if (time < 0.75) {
            fromPhase = DayNightPass.phases.dusk
            toPhase = DayNightPass.phases.night
            blend = (time - 0.5) / 0.25
        } else {
            fromPhase = DayNightPass.phases.night
            toPhase = DayNightPass.phases.dawn
            blend = (time - 0.75) / 0.25
        }

        const smoothBlend = blend * blend * (3 - 2 * blend)

        const lerp = (a, b, f) => a + (b - a) * f
        const lerpColor = (a, b, f) => [
            lerp(a[0], b[0], f),
            lerp(a[1], b[1], f),
            lerp(a[2], b[2], f)
        ]

        this.setUniform('uDarkness', lerp(fromPhase.darkness, toPhase.darkness, smoothBlend))
        this.setUniform('uTintStrength', lerp(fromPhase.tintStrength, toPhase.tintStrength, smoothBlend))
        this.setUniform('uTintColor', lerpColor(fromPhase.tintColor, toPhase.tintColor, smoothBlend))
        this.setUniform('uStarsIntensity', lerp(fromPhase.starsIntensity, toPhase.starsIntensity, smoothBlend))

        let sunPos
        const sunStart = 0.03
        const sunEnd = 0.60
        if (time >= sunStart && time < sunEnd) {
            sunPos = (time - sunStart) / (sunEnd - sunStart)
        } else {
            sunPos = -0.5
        }
        this.setUniform('uSunPosition', sunPos)
    }


    setDawn () {
        this.setTimeOfDay(0.0)
    }


    setDay () {
        this.setTimeOfDay(0.25)
    }


    setDusk () {
        this.setTimeOfDay(0.5)
    }


    setNight () {
        this.setTimeOfDay(0.75)
    }


    getShadowParams (t) {
        const cycleOffset = -0.0625
        const time = (((t + cycleOffset) % 1) + 1) % 1

        const sunStart = 0.03
        const sunEnd = 0.60

        let sunProgress
        if (time >= sunStart && time < sunEnd) {
            sunProgress = (time - sunStart) / (sunEnd - sunStart)
        } else {
            sunProgress = -1
        }

        if (sunProgress < 0 || sunProgress > 1) {
            return {
                skewX: 0,
                scaleY: -0.3,
                offsetY: 0.06,
                color: [0, 0, 0, 0.1]
            }
        }

        const sunAngle = (sunProgress - 0.5) * Math.PI

        const skewX = -Math.sin(sunAngle) * 0.8

        const sunHeight = Math.cos(sunAngle)
        const scaleY = -0.2 - sunHeight * 0.3

        const alpha = 0.15 + sunHeight * 0.15

        return {
            skewX,
            scaleY,
            offsetY: 0.06,
            color: [0, 0, 0, alpha]
        }
    }

}
