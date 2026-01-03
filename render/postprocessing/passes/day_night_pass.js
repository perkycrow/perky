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

            // ─────────────────────────────────────────────────────────────
            // Constants
            // ─────────────────────────────────────────────────────────────
            const float PI = 3.14159265;
            const vec2 WORLD_SIZE = vec2(7.0, 5.0);
            const vec2 SUN_ARC = vec2(3.0, 2.5);
            const float SUN_RADIUS = 0.15;
            // Lighting constants
            const float SKY_EXTRA_DARKNESS = 0.35;
            const float MAX_DARKNESS = 0.85;
            const vec3 SUN_COLOR_HIGH = vec3(1.0, 0.95, 0.85);
            const vec3 SUN_COLOR_LOW = vec3(1.0, 0.5, 0.2);
            const vec3 GOLDEN_TINT = vec3(1.0, 0.75, 0.55);

            // Sun disc/halo
            const float DISC_OUTER = 0.03;
            const float DISC_INNER = 0.025;
            const float HALO_OUTER = 0.08;
            const float HALO_INNER = 0.03;
            const float HALO_STRENGTH = 0.3;

            // Stars
            const vec2 STAR_GRID = vec2(100.0, 60.0);
            const vec2 STAR_SPEED = vec2(0.008, 0.003);
            const float STAR_THRESHOLD = 0.92;

            // DEBUG: uncomment to visualize sun radius and terrain intersection
            // #define DEBUG_SUN_RADIUS
            // DEBUG: uncomment to visualize hill circles
            // #define DEBUG_HILLS

            // ─────────────────────────────────────────────────────────────
            // Utilities
            // ─────────────────────────────────────────────────────────────
            float random(vec2 st) {
                return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
            }

            // ─────────────────────────────────────────────────────────────
            // Coordinate transforms
            // ─────────────────────────────────────────────────────────────
            void getScreenWorldParams(out vec2 margin, out vec2 scale) {
                float ratio = uAspectRatio / uCameraRatio;
                margin = vec2(
                    uAspectRatio > uCameraRatio ? (1.0 - 1.0/ratio) * 0.5 : 0.0,
                    uAspectRatio < uCameraRatio ? (1.0 - ratio) * 0.5 : 0.0
                );
                scale = vec2(
                    uAspectRatio > uCameraRatio ? ratio : 1.0,
                    uAspectRatio < uCameraRatio ? 1.0/ratio : 1.0
                );
            }

            vec2 screenToWorld(vec2 uv) {
                vec2 margin, scale;
                getScreenWorldParams(margin, scale);
                return ((uv - margin) * scale - 0.5) * WORLD_SIZE;
            }

            vec2 worldToScreen(vec2 w) {
                vec2 margin, scale;
                getScreenWorldParams(margin, scale);
                return (w / WORLD_SIZE + 0.5) / scale + margin;
            }

            // ─────────────────────────────────────────────────────────────
            // Terrain
            // ─────────────────────────────────────────────────────────────
            float hillHeight(vec2 center, float radius, float x) {
                float dx = x - center.x;
                float rSq = radius * radius;
                return center.y + sqrt(rSq - dx * dx);
            }

            float terrainHeight(float x) {
                return max(hillHeight(uHill1, uHill1R, x), hillHeight(uHill2, uHill2R, x));
            }

            // ─────────────────────────────────────────────────────────────
            // Sun calculations
            // ─────────────────────────────────────────────────────────────
            struct SunData {
                vec2 pos;
                vec3 color;
                float terrainY;
                float top;
                float bottom;
                bool intersectsTerrain;
                float intersectStrength;
            };

            vec2 calcSunPos(float progress) {
                float a = progress * PI;
                return vec2(-cos(a), sin(a)) * SUN_ARC;
            }

            vec3 calcSunColor(float y) {
                float h = 1.0 - smoothstep(0.3, 1.5, y);
                return mix(SUN_COLOR_HIGH, SUN_COLOR_LOW, h);
            }

            SunData getSunData() {
                SunData s;
                s.pos = calcSunPos(uSunProgress);
                s.color = calcSunColor(s.pos.y);
                s.terrainY = terrainHeight(s.pos.x);
                s.top = s.pos.y + SUN_RADIUS;
                s.bottom = s.pos.y - SUN_RADIUS;
                s.intersectsTerrain = s.bottom < s.terrainY && s.top > s.terrainY;
                s.intersectStrength = s.intersectsTerrain
                    ? min(s.terrainY - s.bottom, s.top - s.terrainY) / SUN_RADIUS
                    : 0.0;
                return s;
            }

            // ─────────────────────────────────────────────────────────────
            // Effects
            // ─────────────────────────────────────────────────────────────
            float rayPattern(float angle, float dist) {
                float t = uTime * 0.015;
                float s = mix(3.0, 1.5, smoothstep(0.0, 2.0, dist));
                float r1 = pow(abs(sin(angle * 6.0 + t)), s);
                float r2 = pow(abs(sin(angle * 9.0 + 2.0 - t * 0.6)), s);
                return (r1 + r2) * 0.4;
            }

            vec3 applyGoldenHour(vec3 rgb, float sunY) {
                float golden = 1.0 - smoothstep(0.3, 1.5, sunY);
                float sunFade = smoothstep(0.0, 0.1, uSunProgress) * smoothstep(1.0, 0.9, uSunProgress);
                return rgb * mix(vec3(1.0), GOLDEN_TINT, golden * 0.4 * sunFade);
            }

            vec3 applySunDisc(vec3 rgb, vec2 uv, SunData sun, float skyFactor) {
                vec2 diff = (uv - worldToScreen(sun.pos)) * vec2(uAspectRatio, 1.0);
                float d = length(diff);
                float disc = smoothstep(DISC_OUTER, DISC_INNER, d);
                float halo = smoothstep(HALO_OUTER, HALO_INNER, d) * HALO_STRENGTH;
                return rgb + sun.color * (disc + halo) * skyFactor;
            }

            vec3 applyRays(vec3 rgb, vec2 world, SunData sun, float terrain, bool inSky) {
                float shimmer = sin(uTime * 0.5) * 0.15 + 0.85;
                vec2 rayOrigin = vec2(sun.pos.x, sun.terrainY);
                vec2 toPixel = world - rayOrigin;
                float dist = length(toPixel);
                float angle = atan(toPixel.y, toPixel.x);
                float pattern = rayPattern(angle, dist);
                float originFade = smoothstep(0.0, 0.8, dist);

                if (inSky) {
                    float falloff = exp(-dist * 0.8) * smoothstep(0.15, 0.5, dist);
                    rgb += sun.color * pattern * falloff * sun.intersectStrength * shimmer * originFade * 2.0;
                } else {
                    float falloff = exp(-dist * 0.5) * smoothstep(2.5, 0.2, abs(world.x - sun.pos.x));
                    rgb += sun.color * pattern * falloff * sun.intersectStrength * shimmer * originFade * 1.2;
                }
                return rgb;
            }

            vec3 applyStars(vec3 rgb, vec2 uv, vec4 baseColor) {
                vec2 starUV = uv + STAR_SPEED * uTime;
                vec2 cell = floor(starUV * STAR_GRID);
                float r = random(cell);

                if (r > STAR_THRESHOLD) {
                    vec2 cellUV = fract(starUV * STAR_GRID);
                    vec2 starPos = vec2(random(cell + 0.1), random(cell + 0.2));
                    float star = smoothstep(0.12, 0.0, length(cellUV - starPos));
                    float twinkle = sin(uTime * (1.5 + r * 2.0) + r * 6.28) * 0.3 + 0.7;
                    float lum = dot(baseColor.rgb, vec3(0.299, 0.587, 0.114));
                    rgb += vec3(uStarsIntensity * star * twinkle * smoothstep(0.5, 1.0, lum));
                }
                return rgb;
            }

            // ─────────────────────────────────────────────────────────────
            // Debug visualization
            // ─────────────────────────────────────────────────────────────
            #ifdef DEBUG_HILLS
            vec3 debugHills(vec3 rgb, vec2 world) {
                float d1 = length(world - uHill1);
                float d2 = length(world - uHill2);
                if (d1 < uHill1R) rgb = mix(rgb, vec3(1.0, 0.0, 0.0), 0.3);
                if (d2 < uHill2R) rgb = mix(rgb, vec3(0.0, 0.0, 1.0), 0.3);
                return rgb;
            }
            #endif

            #ifdef DEBUG_SUN_RADIUS
            vec3 debugSun(vec3 rgb, vec2 world, SunData sun) {
                float distToSun = length(world - sun.pos);
                if (abs(distToSun - SUN_RADIUS) < 0.004) return vec3(1.0, 1.0, 0.0);
                if (distToSun < 0.006) return vec3(1.0, 0.0, 0.0);
                if (abs(world.x - sun.pos.x) < 0.004 && abs(world.y - sun.terrainY) < 0.006) return vec3(0.0, 1.0, 0.0);
                if (abs(world.y - sun.bottom) < 0.002 && abs(world.x - sun.pos.x) < 0.3) return vec3(0.0, 1.0, 1.0);
                if (abs(world.y - sun.top) < 0.002 && abs(world.x - sun.pos.x) < 0.3) return vec3(1.0, 0.0, 1.0);
                if (sun.intersectsTerrain && abs(world.x - sun.pos.x) < 0.01 && world.y > sun.terrainY && world.y < sun.terrainY + 0.02) return vec3(1.0);
                return rgb;
            }
            #endif

            // ─────────────────────────────────────────────────────────────
            // Main
            // ─────────────────────────────────────────────────────────────
            void main() {
                vec4 color = texture(uTexture, vTexCoord);
                vec2 world = screenToWorld(vTexCoord);
                float terrain = terrainHeight(world.x);
                bool inSky = world.y > terrain;

                // Sky detection
                float blueness = color.b - max(color.r, color.g);
                float skyFactor = smoothstep(-0.08, 0.15, blueness);

                // Base color with darkness and tint
                float darkness = min(uDarkness + skyFactor * SKY_EXTRA_DARKNESS, MAX_DARKNESS);
                vec3 rgb = color.rgb * (1.0 - darkness);
                rgb = mix(rgb, rgb * uTintColor, uTintStrength);

                // Sun effects
                bool sunVisible = uSunProgress > 0.0 && uSunProgress < 1.0;
                if (sunVisible) {
                    SunData sun = getSunData();

                    if (blueness > 0.0) {
                        rgb = applyGoldenHour(rgb, sun.pos.y);
                    }
                    if (inSky) {
                        rgb = applySunDisc(rgb, vTexCoord, sun, skyFactor);
                    }
                    if (sun.intersectsTerrain) {
                        rgb = applyRays(rgb, world, sun, terrain, inSky);
                    }

                    #ifdef DEBUG_SUN_RADIUS
                    rgb = debugSun(rgb, world, sun);
                    #endif
                }

                #ifdef DEBUG_HILLS
                rgb = debugHills(rgb, world);
                #endif

                // Stars
                if (blueness > 0.0 && uStarsIntensity > 0.0) {
                    rgb = applyStars(rgb, vTexCoord, color);
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
