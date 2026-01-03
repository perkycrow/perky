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
            uniform float uTime;
            uniform float uSunProgress;
            uniform float uAspectRatio;
            uniform vec2 uHill1;
            uniform float uHill1R;
            uniform vec2 uHill2;
            uniform float uHill2R;
            uniform float uCameraRatio;
            in vec2 vTexCoord;
            out vec4 fragColor;

            const float PI = 3.14159265;
            const vec2 WORLD_SIZE = vec2(7.0, 5.0);
            const vec2 SUN_ARC = vec2(3.0, 2.5);
            const float SUN_RADIUS = 0.15;

            // DEBUG: uncomment to visualize sun radius and terrain intersection
            // #define DEBUG_SUN_RADIUS
            // DEBUG: uncomment to visualize hill circles
            // #define DEBUG_HILLS

            float random(vec2 st) {
                return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
            }

            vec2 screenToWorld(vec2 uv) {
                float ratio = uAspectRatio / uCameraRatio;
                vec2 margin = vec2(
                    uAspectRatio > uCameraRatio ? (1.0 - 1.0/ratio) * 0.5 : 0.0,
                    uAspectRatio < uCameraRatio ? (1.0 - ratio) * 0.5 : 0.0
                );
                vec2 scale = vec2(
                    uAspectRatio > uCameraRatio ? ratio : 1.0,
                    uAspectRatio < uCameraRatio ? 1.0/ratio : 1.0
                );
                return ((uv - margin) * scale - 0.5) * WORLD_SIZE;
            }

            vec2 worldToScreen(vec2 w) {
                float ratio = uAspectRatio / uCameraRatio;
                vec2 margin = vec2(
                    uAspectRatio > uCameraRatio ? (1.0 - 1.0/ratio) * 0.5 : 0.0,
                    uAspectRatio < uCameraRatio ? (1.0 - ratio) * 0.5 : 0.0
                );
                vec2 scale = vec2(
                    uAspectRatio > uCameraRatio ? 1.0/ratio : 1.0,
                    uAspectRatio < uCameraRatio ? ratio : 1.0
                );
                return (w / WORLD_SIZE + 0.5) * scale + margin;
            }

            float terrainHeight(float x) {
                float dx1 = x - uHill1.x;
                float dx2 = x - uHill2.x;
                float h1 = dx1*dx1 < uHill1R*uHill1R ? uHill1.y + sqrt(uHill1R*uHill1R - dx1*dx1) : -999.0;
                float h2 = dx2*dx2 < uHill2R*uHill2R ? uHill2.y + sqrt(uHill2R*uHill2R - dx2*dx2) : -999.0;
                return max(h1, h2);
            }

            vec2 sunPos(float p) {
                float a = p * PI;
                return vec2(-cos(a), sin(a)) * SUN_ARC;
            }

            vec3 sunColor(float y) {
                float h = 1.0 - smoothstep(0.3, 1.5, y);
                return mix(vec3(1.0, 0.95, 0.85), vec3(1.0, 0.5, 0.2), h);
            }

            float rayPattern(float angle, float dist) {
                float t = uTime * 0.015;
                float s = mix(3.0, 1.5, smoothstep(0.0, 2.0, dist));
                float r1 = pow(abs(sin(angle * 6.0 + t)), s);
                float r2 = pow(abs(sin(angle * 9.0 + 2.0 - t * 0.6)), s);
                return (r1 + r2) * 0.4;
            }

            void main() {
                vec4 color = texture(uTexture, vTexCoord);
                vec2 world = screenToWorld(vTexCoord);
                float terrain = terrainHeight(world.x);
                bool inSky = world.y > terrain;

                // Sky detection by color
                float blueness = color.b - max(color.r, color.g);
                float skyFactor = smoothstep(-0.08, 0.15, blueness);

                // Base color with darkness and tint
                vec3 rgb = color.rgb * (1.0 - min(uDarkness + skyFactor * 0.35, 0.85));
                rgb = mix(rgb, rgb * uTintColor, uTintStrength);

                // Sun
                bool sunVisible = uSunProgress > 0.0 && uSunProgress < 1.0;
                if (sunVisible) {
                    vec2 sun = sunPos(uSunProgress);
                    float sunTerrain = terrainHeight(sun.x);
                    vec3 sColor = sunColor(sun.y);

                    // Golden hour tint on sky (fade in/out at sunrise/sunset)
                    if (blueness > 0.0) {
                        float golden = 1.0 - smoothstep(0.3, 1.5, sun.y);
                        float sunFade = smoothstep(0.0, 0.1, uSunProgress) * smoothstep(1.0, 0.9, uSunProgress);
                        rgb *= mix(vec3(1.0), vec3(1.0, 0.75, 0.55), golden * 0.4 * sunFade);
                    }

                    // Sun disc + halo (only in sky)
                    if (inSky) {
                        vec2 diff = (vTexCoord - worldToScreen(sun)) * vec2(uAspectRatio, 1.0);
                        float d = length(diff);
                        float disc = smoothstep(0.03, 0.025, d);
                        float halo = smoothstep(0.08, 0.03, d) * 0.3;
                        rgb += sColor * (disc + halo) * skyFactor;
                    }

                    // Rays (when sun intersects terrain)
                    float sunTop = sun.y + SUN_RADIUS;
                    float sunBottom = sun.y - SUN_RADIUS;
                    bool intersects = sunBottom < sunTerrain && sunTop > sunTerrain;

                    if (intersects) {
                        float strength = min(sunTerrain - sunBottom, sunTop - sunTerrain) / SUN_RADIUS;
                        float shimmer = sin(uTime * 0.5) * 0.15 + 0.85;
                        vec2 rayOrigin = vec2(sun.x, sunTerrain);
                        vec2 toPixel = world - rayOrigin;
                        float dist = length(toPixel);
                        float angle = atan(toPixel.y, toPixel.x);
                        float pattern = rayPattern(angle, dist);

                        // Fade in rays near origin (blinding effect)
                        float originFade = smoothstep(0.0, 0.8, dist);

                        if (inSky) {
                            // Sky rays
                            float falloff = exp(-dist * 0.8) * smoothstep(0.15, 0.5, dist);
                            rgb += sColor * pattern * falloff * strength * shimmer * originFade * 2.0;
                        } else if (terrain > -900.0) {
                            // Ground rays
                            float falloff = exp(-dist * 0.5) * smoothstep(2.5, 0.2, abs(world.x - sun.x));
                            rgb += sColor * pattern * falloff * strength * shimmer * originFade * 1.2;
                        }
                    }
                }

                // DEBUG: visualize hill circles
                #ifdef DEBUG_HILLS
                {
                    float distToHill1 = length(world - uHill1);
                    float distToHill2 = length(world - uHill2);

                    // Hill 1 filled circle (red, 30% opacity)
                    if (distToHill1 < uHill1R) rgb = mix(rgb, vec3(1.0, 0.0, 0.0), 0.3);
                    // Hill 2 filled circle (blue, 30% opacity)
                    if (distToHill2 < uHill2R) rgb = mix(rgb, vec3(0.0, 0.0, 1.0), 0.3);
                }
                #endif

                // DEBUG: visualize sun radius and intersection zone
                #ifdef DEBUG_SUN_RADIUS
                if (sunVisible) {
                    vec2 sun = sunPos(uSunProgress);
                    float sunTerrain = terrainHeight(sun.x);
                    float distToSun = length(world - sun);
                    float sunBottom = sun.y - SUN_RADIUS;
                    float sunTop = sun.y + SUN_RADIUS;

                    // Sun disc outline (yellow)
                    if (abs(distToSun - SUN_RADIUS) < 0.004) rgb = vec3(1.0, 1.0, 0.0);
                    // Sun center (red dot)
                    if (distToSun < 0.006) rgb = vec3(1.0, 0.0, 0.0);
                    // Terrain at sun X (green)
                    if (abs(world.x - sun.x) < 0.004 && abs(world.y - sunTerrain) < 0.006) rgb = vec3(0.0, 1.0, 0.0);
                    // Sun bottom (cyan)
                    if (abs(world.y - sunBottom) < 0.002 && abs(world.x - sun.x) < 0.3) rgb = vec3(0.0, 1.0, 1.0);
                    // Sun top (magenta)
                    if (abs(world.y - sunTop) < 0.002 && abs(world.x - sun.x) < 0.3) rgb = vec3(1.0, 0.0, 1.0);
                    // Intersection active (white)
                    bool intersects = sunBottom < sunTerrain && sunTop > sunTerrain;
                    if (intersects && abs(world.x - sun.x) < 0.01 && world.y > sunTerrain && world.y < sunTerrain + 0.02) rgb = vec3(1.0);
                }
                #endif

                // Stars (moving diagonally like celestial rotation)
                if (blueness > 0.0 && uStarsIntensity > 0.0) {
                    vec2 starUV = vTexCoord + vec2(uTime * 0.008, uTime * 0.003);
                    vec2 cell = floor(starUV * vec2(100.0, 60.0));
                    float r = random(cell);

                    if (r > 0.92) {
                        vec2 cellUV = fract(starUV * vec2(100.0, 60.0));
                        vec2 starPos = vec2(random(cell + 0.1), random(cell + 0.2));
                        float star = smoothstep(0.12, 0.0, length(cellUV - starPos));
                        float twinkle = sin(uTime * (1.5 + r * 2.0) + r * 6.28) * 0.3 + 0.7;
                        float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                        rgb += vec3(uStarsIntensity * star * twinkle * smoothstep(0.5, 1.0, lum));
                    }
                }

                fragColor = vec4(clamp(rgb, 0.0, 1.0), color.a);
            }
        `,
        uniforms: ['uTexture', 'uDarkness', 'uTintStrength', 'uTintColor', 'uStarsIntensity', 'uTime', 'uSunProgress', 'uAspectRatio', 'uHill1', 'uHill1R', 'uHill2', 'uHill2R', 'uCameraRatio'],
        attributes: ['aPosition', 'aTexCoord']
    }

    static defaultUniforms = {
        uDarkness: 0.4,
        uTintStrength: 0.5,
        uTintColor: [0.4, 0.5, 0.8],
        uStarsIntensity: 1.2,
        uHill1: [-4.5, -20.68],
        uHill1R: 22.65,
        uHill2: [3.55, -14.0],
        uHill2R: 15.95,
        uCameraRatio: 1.4,
        uTime: 0.0,
        uSunProgress: -1.0,
        uAspectRatio: 1.0
    }

    static uniformConfig = {
        uDarkness: {min: 0, max: 1, step: 0.01},
        uTintStrength: {min: 0, max: 1, step: 0.01},
        uTintColor: {type: 'color'},
        uStarsIntensity: {min: 0, max: 1, step: 0.01},
        uSunProgress: {min: -0.5, max: 1.5, step: 0.01},
        uHill1: {type: 'vec2'},
        uHill1R: {min: 0, max: 30, step: 0.1},
        uHill2: {type: 'vec2'},
        uHill2R: {min: 0, max: 30, step: 0.1}
    }

    static phases = [
        {name: 'dawn', darkness: 0.08, tintStrength: 0.5, tintColor: [1.0, 0.65, 0.45], starsIntensity: 0.0},
        {name: 'day', darkness: 0.0, tintStrength: 0.0, tintColor: [1.0, 1.0, 1.0], starsIntensity: 0.0},
        {name: 'dusk', darkness: 0.35, tintStrength: 0.55, tintColor: [1.0, 0.35, 0.25], starsIntensity: 0.0},
        {name: 'night', darkness: 0.4, tintStrength: 0.5, tintColor: [0.4, 0.5, 0.8], starsIntensity: 1.2}
    ]

    static sunStart = 0.03
    static sunEnd = 0.60
    static cycleOffset = -0.0625

    setTimeOfDay (t) {
        const time = (((t + DayNightPass.cycleOffset) % 1) + 1) % 1
        const phases = DayNightPass.phases

        const phaseIndex = Math.floor(time * 4)
        const blend = (time * 4) % 1
        const smooth = blend * blend * (3 - 2 * blend)

        const from = phases[phaseIndex]
        const to = phases[(phaseIndex + 1) % 4]

        const lerp = (a, b) => a + (b - a) * smooth

        this.setUniform('uDarkness', lerp(from.darkness, to.darkness))
        this.setUniform('uTintStrength', lerp(from.tintStrength, to.tintStrength))
        this.setUniform('uTintColor', from.tintColor.map((v, i) => lerp(v, to.tintColor[i])))
        this.setUniform('uStarsIntensity', lerp(from.starsIntensity, to.starsIntensity))

        const {sunStart, sunEnd} = DayNightPass
        const sunProgress = (time >= sunStart && time < sunEnd)
            ? (time - sunStart) / (sunEnd - sunStart)
            : -1.0
        this.setUniform('uSunProgress', sunProgress)
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
        const time = (((t + DayNightPass.cycleOffset) % 1) + 1) % 1
        const {sunStart, sunEnd} = DayNightPass

        const sunProgress = (time >= sunStart && time < sunEnd)
            ? (time - sunStart) / (sunEnd - sunStart)
            : -1

        if (sunProgress < 0 || sunProgress > 1) {
            return {skewX: 0, scaleY: -0.3, offsetY: 0.06, color: [0, 0, 0, 0.1]}
        }

        const angle = sunProgress * Math.PI
        const sunX = -Math.cos(angle) * 3.0
        const sunY = Math.sin(angle) * 2.5

        return {
            skewX: -sunX * 0.25,
            scaleY: -0.2 - sunY * 0.12,
            offsetY: 0.06,
            color: [0, 0, 0, 0.1 + sunY * 0.1]
        }
    }

}
