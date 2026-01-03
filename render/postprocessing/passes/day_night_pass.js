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
            uniform float uDayNightProgress;
            uniform float uTime;
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
            const vec2 SUN_ARC = vec2(2.95, 2.325);
            const float SUN_RADIUS = 0.15;
            // Lighting constants
            const float SKY_EXTRA_DARKNESS = 0.35;
            const float MAX_DARKNESS = 0.85;
            const vec3 SUN_COLOR_HIGH = vec3(1.0, 0.95, 0.85);
            const vec3 SUN_COLOR_LOW = vec3(1.0, 0.5, 0.2);
            const vec3 GOLDEN_TINT = vec3(1.0, 0.75, 0.55);

            // Ambiance colors (progress: 0=midnight, 0.25=dawn, 0.5=noon, 0.75=dusk)
            const vec3 TINT_MIDNIGHT = vec3(0.4, 0.5, 0.8);
            const vec3 TINT_DAWN = vec3(1.0, 0.65, 0.45);
            const vec3 TINT_NOON = vec3(1.0, 1.0, 1.0);
            const vec3 TINT_DUSK = vec3(1.0, 0.35, 0.25);

            const float DARKNESS_MIDNIGHT = 0.4;
            const float DARKNESS_DAWN = 0.08;
            const float DARKNESS_NOON = 0.0;
            const float DARKNESS_DUSK = 0.35;

            const float TINT_STRENGTH_MIDNIGHT = 0.5;
            const float TINT_STRENGTH_DAWN = 0.5;
            const float TINT_STRENGTH_NOON = 0.0;
            const float TINT_STRENGTH_DUSK = 0.55;

            const float STARS_MIDNIGHT = 1.2;
            const float STARS_DAWN = 0.0;
            const float STARS_NOON = 0.0;
            const float STARS_DUSK = 0.0;

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
            // DEBUG: uncomment to visualize sun trajectory
            // #define DEBUG_SUN_PATH

            // ─────────────────────────────────────────────────────────────
            // Utilities
            // ─────────────────────────────────────────────────────────────
            float random(vec2 st) {
                return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
            }

            // ─────────────────────────────────────────────────────────────
            // Day/Night cycle ambiance calculations
            // ─────────────────────────────────────────────────────────────
            // progress: 0=midnight, 0.25=dawn, 0.5=noon, 0.75=dusk, 1=midnight

            float smoothBlend(float t) {
                return t * t * (3.0 - 2.0 * t);
            }

            struct Ambiance {
                float darkness;
                float tintStrength;
                vec3 tintColor;
                float starsIntensity;
                float sunProgress;
            };

            Ambiance getAmbiance() {
                Ambiance a;

                // Game mapping: 0=dawn, 0.25=day, 0.5=dusk, 0.75=night
                float phase = uDayNightProgress * 4.0;
                int phaseIndex = int(floor(phase));
                float blend = smoothBlend(fract(phase));

                // Phase transitions: dawn->day->dusk->night->dawn
                if (phaseIndex == 0) {
                    // dawn -> day (0.0 - 0.25)
                    a.darkness = mix(DARKNESS_DAWN, DARKNESS_NOON, blend);
                    a.tintStrength = mix(TINT_STRENGTH_DAWN, TINT_STRENGTH_NOON, blend);
                    a.tintColor = mix(TINT_DAWN, TINT_NOON, blend);
                    a.starsIntensity = mix(STARS_DAWN, STARS_NOON, blend);
                } else if (phaseIndex == 1) {
                    // day -> dusk (0.25 - 0.5)
                    a.darkness = mix(DARKNESS_NOON, DARKNESS_DUSK, blend);
                    a.tintStrength = mix(TINT_STRENGTH_NOON, TINT_STRENGTH_DUSK, blend);
                    a.tintColor = mix(TINT_NOON, TINT_DUSK, blend);
                    a.starsIntensity = mix(STARS_NOON, STARS_DUSK, blend);
                } else if (phaseIndex == 2) {
                    // dusk -> night (0.5 - 0.75)
                    a.darkness = mix(DARKNESS_DUSK, DARKNESS_MIDNIGHT, blend);
                    a.tintStrength = mix(TINT_STRENGTH_DUSK, TINT_STRENGTH_MIDNIGHT, blend);
                    a.tintColor = mix(TINT_DUSK, TINT_MIDNIGHT, blend);
                    a.starsIntensity = mix(STARS_DUSK, STARS_MIDNIGHT, blend);
                } else {
                    // night -> dawn (0.75 - 1.0)
                    a.darkness = mix(DARKNESS_MIDNIGHT, DARKNESS_DAWN, blend);
                    a.tintStrength = mix(TINT_STRENGTH_MIDNIGHT, TINT_STRENGTH_DAWN, blend);
                    a.tintColor = mix(TINT_MIDNIGHT, TINT_DAWN, blend);
                    a.starsIntensity = mix(STARS_MIDNIGHT, STARS_DAWN, blend);
                }

                // Sun progress: visible during dawn+day (0 to 0.5)
                // Tweak these to align sun with hill intersections at phase transitions
                const float SUN_AT_DAWN_END = 0.285;  // sunProgress when progress=0.25 (dawn->day)
                const float SUN_AT_DAY_END = 0.7185;   // sunProgress when progress=0.5 (day->dusk)

                if (uDayNightProgress >= 0.0 && uDayNightProgress <= 0.5) {
                    // Linear interpolation from SUN_AT_DAWN_END to SUN_AT_DAY_END
                    // At progress=0: extrapolate backwards
                    // At progress=0.25: SUN_AT_DAWN_END
                    // At progress=0.5: SUN_AT_DAY_END
                    float slope = (SUN_AT_DAY_END - SUN_AT_DAWN_END) / 0.25;
                    a.sunProgress = SUN_AT_DAWN_END + slope * (uDayNightProgress - 0.25);
                } else {
                    a.sunProgress = -1.0;
                }

                return a;
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

            SunData getSunDataFromProgress(float progress) {
                SunData s;
                s.pos = calcSunPos(progress);
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

            vec3 applyGoldenHour(vec3 rgb, float sunY, float sunProgress) {
                float golden = 1.0 - smoothstep(0.3, 1.5, sunY);
                float sunFade = smoothstep(0.0, 0.1, sunProgress) * smoothstep(1.0, 0.9, sunProgress);
                return rgb * mix(vec3(1.0), GOLDEN_TINT, golden * 0.4 * sunFade);
            }

            vec3 applySunDisc(vec3 rgb, vec2 uv, SunData sun) {
                vec2 sunScreen = worldToScreen(sun.pos);
                vec2 diff = (uv - sunScreen) * vec2(uAspectRatio, 1.0);
                float d = length(diff);
                float disc = smoothstep(DISC_OUTER, DISC_INNER, d);
                float halo = smoothstep(HALO_OUTER, HALO_INNER, d) * HALO_STRENGTH;
                return rgb + sun.color * (disc + halo);
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

            vec3 applyStars(vec3 rgb, vec2 uv, vec4 baseColor, float starsIntensity) {
                vec2 starUV = uv + STAR_SPEED * uTime;
                vec2 cell = floor(starUV * STAR_GRID);
                float r = random(cell);

                if (r > STAR_THRESHOLD) {
                    vec2 cellUV = fract(starUV * STAR_GRID);
                    vec2 starPos = vec2(random(cell + 0.1), random(cell + 0.2));
                    float star = smoothstep(0.12, 0.0, length(cellUV - starPos));
                    float twinkle = sin(uTime * (1.5 + r * 2.0) + r * 6.28) * 0.3 + 0.7;
                    float lum = dot(baseColor.rgb, vec3(0.299, 0.587, 0.114));
                    rgb += vec3(starsIntensity * star * twinkle * smoothstep(0.5, 1.0, lum));
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

            #ifdef DEBUG_SUN_PATH
            vec3 debugSunPath(vec3 rgb, vec2 world, float sunProgress) {
                float minDist = 1000.0;
                float closestProgress = 0.0;

                // Sample trajectory to find closest point
                for (float p = 0.0; p <= 1.0; p += 0.01) {
                    vec2 sunPos = calcSunPos(p);
                    float d = length(world - sunPos);
                    if (d < minDist) {
                        minDist = d;
                        closestProgress = p;
                    }
                }

                // Draw trajectory line (yellow)
                if (minDist < 0.04) {
                    rgb = mix(rgb, vec3(1.0, 1.0, 0.0), 0.8);
                }

                // Draw markers at key positions
                // Dawn intersection (progress ~0) - cyan
                vec2 dawnPos = calcSunPos(0.0);
                if (length(world - dawnPos) < 0.08) {
                    rgb = mix(rgb, vec3(0.0, 1.0, 1.0), 0.9);
                }

                // Dusk intersection (progress ~1) - magenta
                vec2 duskPos = calcSunPos(1.0);
                if (length(world - duskPos) < 0.08) {
                    rgb = mix(rgb, vec3(1.0, 0.0, 1.0), 0.9);
                }

                // Zenith (progress = 0.5) - white
                vec2 zenithPos = calcSunPos(0.5);
                if (length(world - zenithPos) < 0.08) {
                    rgb = mix(rgb, vec3(1.0, 1.0, 1.0), 0.9);
                }

                // Current sun position - red circle (only if sun is visible)
                if (sunProgress >= 0.0 && sunProgress <= 1.0) {
                    vec2 currentPos = calcSunPos(sunProgress);
                    float distToCurrent = length(world - currentPos);
                    if (distToCurrent < SUN_RADIUS + 0.02 && distToCurrent > SUN_RADIUS - 0.02) {
                        rgb = mix(rgb, vec3(1.0, 0.0, 0.0), 0.9);
                    }
                }

                // Draw terrain intersection points (green dots where sun touches hills)
                for (float p = 0.0; p <= 1.0; p += 0.01) {
                    vec2 sunPos = calcSunPos(p);
                    float terrainY = terrainHeight(sunPos.x);
                    float sunBottom = sunPos.y - SUN_RADIUS;
                    float sunTop = sunPos.y + SUN_RADIUS;

                    // Check if sun intersects terrain at this progress
                    if (sunBottom < terrainY && sunTop > terrainY) {
                        vec2 intersectPoint = vec2(sunPos.x, terrainY);
                        if (length(world - intersectPoint) < 0.06) {
                            rgb = mix(rgb, vec3(0.0, 1.0, 0.0), 0.9);
                        }
                    }
                }

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

                // Get ambiance from day/night progress
                Ambiance ambiance = getAmbiance();

                // Sky detection
                float blueness = color.b - max(color.r, color.g);
                float skyFactor = smoothstep(-0.08, 0.15, blueness);

                // Base color with darkness and tint
                float darkness = min(ambiance.darkness + skyFactor * SKY_EXTRA_DARKNESS, MAX_DARKNESS);
                vec3 rgb = color.rgb * (1.0 - darkness);
                rgb = mix(rgb, rgb * ambiance.tintColor, ambiance.tintStrength);

                // Sun effects
                bool sunVisible = ambiance.sunProgress >= 0.0 && ambiance.sunProgress <= 1.0;
                if (sunVisible) {
                    SunData sun = getSunDataFromProgress(ambiance.sunProgress);

                    if (blueness > 0.0) {
                        rgb = applyGoldenHour(rgb, sun.pos.y, ambiance.sunProgress);
                    }
                    if (inSky) {
                        rgb = applySunDisc(rgb, vTexCoord, sun);
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

                #ifdef DEBUG_SUN_PATH
                rgb = debugSunPath(rgb, world, ambiance.sunProgress);
                #endif

                // Stars
                if (blueness > 0.0 && ambiance.starsIntensity > 0.0) {
                    rgb = applyStars(rgb, vTexCoord, color, ambiance.starsIntensity);
                }

                fragColor = vec4(clamp(rgb, 0.0, 1.0), color.a);
            }
        `,
        uniforms: ['uTexture', 'uDayNightProgress', 'uTime', 'uAspectRatio', 'uHill1', 'uHill1R', 'uHill2', 'uHill2R', 'uCameraRatio'],
        attributes: ['aPosition', 'aTexCoord']
    }

    static defaultUniforms = {
        uDayNightProgress: 0.0,
        uHill1: [-4.5, -20.68],
        uHill1R: 22.65,
        uHill2: [3.55, -14.0],
        uHill2R: 15.95,
        uCameraRatio: 1.4,
        uTime: 0.0,
        uAspectRatio: 1.0
    }

    static uniformConfig = {
        uDayNightProgress: {min: 0, max: 1, step: 0.01},
        uHill1: {type: 'vec2'},
        uHill1R: {min: 0, max: 30, step: 0.1},
        uHill2: {type: 'vec2'},
        uHill2R: {min: 0, max: 30, step: 0.1}
    }

    setProgress (progress) {
        // Direct pass-through: 0=dawn, 0.25=day, 0.5=dusk, 0.75=night
        this.setUniform('uDayNightProgress', ((progress % 1) + 1) % 1)
    }

    setDawn () {
        this.setProgress(0.0)
    }

    setDay () {
        this.setProgress(0.25)
    }

    setDusk () {
        this.setProgress(0.5)
    }

    setNight () {
        this.setProgress(0.75)
    }

    getShadowParams (progress) {
        // Input uses game mapping: 0=dawn, 0.25=noon, 0.5=dusk, 0.75=midnight
        // Sun visible from dawn (0) to dusk (0.5)
        const p = ((progress % 1) + 1) % 1

        if (p > 0.5) {
            return {skewX: 0, scaleY: -0.3, offsetY: 0.06, color: [0, 0, 0, 0.1]}
        }

        const sunProgress = p / 0.5  // 0->1 over dawn to dusk
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
