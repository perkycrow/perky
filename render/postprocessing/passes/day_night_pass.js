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

            // ─────────────────────────────────────────────────────────────
            // Ambiance based on sun position (not time!)
            // ─────────────────────────────────────────────────────────────
            // Night: sun fully below terrain
            const vec3 TINT_NIGHT = vec3(0.4, 0.5, 0.8);
            const float DARK_NIGHT = 0.4;
            const float TINT_STR_NIGHT = 0.5;
            const float STARS_NIGHT = 1.2;

            // Horizon: sun approaching/leaving terrain
            const vec3 TINT_HORIZON = vec3(1.0, 0.7, 0.55);
            const float DARK_HORIZON = 0.12;
            const float TINT_STR_HORIZON = 0.5;

            // Rays: sun intersecting terrain
            const vec3 TINT_RAYS = vec3(1.0, 0.6, 0.5);
            const float DARK_RAYS = 0.05;
            const float TINT_STR_RAYS = 0.6;

            // Day: sun fully in sky
            const vec3 TINT_DAY = vec3(1.0, 1.0, 1.0);
            const float DARK_DAY = 0.0;
            const float TINT_STR_DAY = 0.0;

            // How far above/below terrain for horizon effect (smaller = faster transition to day)
            const float HORIZON_RANGE = 0.4;

            // Sun disc/halo - stylized illustrative style
            const float SUN_DISC_SIZE = 0.045;        // Size of solid sun disc
            const float SUN_DISC_EDGE = 0.004;        // Soft edge thickness (smaller = sharper)
            const float HALO_SIZE = 0.012;            // Halo extends this far beyond disc
            const float HALO_STRENGTH = 0.4;          // Halo opacity

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
            // Ambiance calculations (based on sun position, not time!)
            // ─────────────────────────────────────────────────────────────

            struct Ambiance {
                float darkness;
                float tintStrength;
                vec3 tintColor;
                float starsIntensity;
                float sunProgress;
            };

            // Calculate ambiance from sun position relative to terrain
            // sunState: how far sun is above terrain (negative = below)
            // intersectStrength: 0-1 when sun intersects terrain
            Ambiance getAmbianceFromSun(float sunTop, float sunBottom, float terrainY, float intersectStrength) {
                Ambiance a;

                // Sun position relative to terrain
                float aboveTerrain = sunBottom - terrainY;  // positive = fully in sky
                float belowTerrain = terrainY - sunTop;     // positive = fully below

                // Smooth blend factors
                float nightFactor = smoothstep(0.0, HORIZON_RANGE, belowTerrain);
                float dayFactor = smoothstep(0.0, HORIZON_RANGE, aboveTerrain);
                float horizonFactor = 1.0 - nightFactor - dayFactor;
                float raysFactor = intersectStrength;

                // Mix ambiance based on sun state
                // Start with night/day/horizon blend
                a.tintColor = mix(
                    mix(TINT_HORIZON, TINT_NIGHT, nightFactor),
                    TINT_DAY,
                    dayFactor
                );
                a.darkness = mix(
                    mix(DARK_HORIZON, DARK_NIGHT, nightFactor),
                    DARK_DAY,
                    dayFactor
                );
                a.tintStrength = mix(
                    mix(TINT_STR_HORIZON, TINT_STR_NIGHT, nightFactor),
                    TINT_STR_DAY,
                    dayFactor
                );

                // Override with rays ambiance when sun intersects terrain
                a.tintColor = mix(a.tintColor, TINT_RAYS, raysFactor);
                a.darkness = mix(a.darkness, DARK_RAYS, raysFactor);
                a.tintStrength = mix(a.tintStrength, TINT_STR_RAYS, raysFactor);

                // Stars only at night
                a.starsIntensity = STARS_NIGHT * nightFactor;

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

            // Smooth terrain detection with anti-aliasing
            float terrainFactor(vec2 world) {
                float terrain = terrainHeight(world.x);
                // Use screen-space derivative for smooth edge
                float pixelSize = fwidth(world.y) * 2.0;
                return smoothstep(terrain - pixelSize, terrain + pixelSize, world.y);
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
                // Main rays - evenly spaced
                float mainRays = smoothstep(0.2, 0.5, sin(angle * 10.0));
                // Secondary rays - offset, dimmer
                float secondaryRays = smoothstep(0.3, 0.6, sin(angle * 10.0 + 0.5)) * 0.4;
                // Variation in intensity per ray
                float variation = 0.7 + 0.3 * sin(angle * 5.0);
                return (mainRays + secondaryRays) * variation * 0.4;
            }

            vec3 applyGoldenHour(vec3 rgb, float sunY, float sunProgress) {
                float golden = 1.0 - smoothstep(0.3, 1.5, sunY);
                float sunFade = smoothstep(0.0, 0.1, sunProgress) * smoothstep(1.0, 0.9, sunProgress);
                return rgb * mix(vec3(1.0), GOLDEN_TINT, golden * 0.4 * sunFade);
            }

            vec3 applySunDisc(vec3 rgb, vec2 uv, SunData sun, float sunProgress) {
                vec2 sunScreen = worldToScreen(sun.pos);
                vec2 diff = (uv - sunScreen) * vec2(uAspectRatio, 1.0);
                float d = length(diff);

                // Defined sun disc with sharp edge
                float disc = 1.0 - smoothstep(SUN_DISC_SIZE - SUN_DISC_EDGE, SUN_DISC_SIZE, d);

                // Halo: semi-transparent ring with sharp outer edge
                float haloStart = SUN_DISC_SIZE;
                float haloEnd = SUN_DISC_SIZE + HALO_SIZE;
                // Sharp cutoff at outer edge, constant opacity inside
                float halo = smoothstep(haloEnd, haloEnd - 0.005, d) * HALO_STRENGTH;
                // Don't add halo where disc already is
                halo *= (1.0 - disc);

                // Sun color shifts more orange/pink when low
                float lowSunFactor = 1.0 - smoothstep(0.0, 1.5, sun.pos.y);
                vec3 discColor = mix(sun.color, vec3(1.0, 0.85, 0.7), lowSunFactor * 0.3);
                vec3 haloColor = mix(sun.color, vec3(1.0, 0.7, 0.5), lowSunFactor * 0.5);

                // Fade effects at sunrise/sunset edges
                float edgeFade = smoothstep(0.0, 0.15, sunProgress) * smoothstep(1.0, 0.85, sunProgress);

                // Combine: solid disc + attached halo glow
                vec3 result = discColor * disc + haloColor * halo;
                return rgb + result * edgeFade;
            }

            vec3 applyRays(vec3 rgb, vec2 world, SunData sun, float terrain, bool inSky) {
                float shimmer = sin(uTime * 0.3) * 0.1 + 0.9;
                vec2 rayOrigin = vec2(sun.pos.x, sun.terrainY);
                vec2 toPixel = world - rayOrigin;
                float dist = length(toPixel);
                float angle = atan(toPixel.y, toPixel.x);
                float pattern = rayPattern(angle, dist);

                // Softer, more atmospheric color for rays
                float lowSunFactor = 1.0 - smoothstep(0.0, 1.5, sun.pos.y);
                vec3 rayColor = mix(sun.color, vec3(1.0, 0.7, 0.5), lowSunFactor * 0.4);

                if (inSky) {
                    // Softer fade from origin
                    float originFade = smoothstep(0.0, 1.2, dist);
                    // Bias rays upward (fan effect like in reference)
                    float upwardBias = smoothstep(-0.5, 1.5, toPixel.y / max(dist, 0.01));
                    // Longer, softer falloff for sky rays
                    float falloff = exp(-dist * 0.4) * smoothstep(0.1, 0.6, dist);
                    rgb += rayColor * pattern * falloff * sun.intersectStrength * shimmer * originFade * upwardBias * 1.5;
                } else {
                    // Slight horizontal stretch on ground
                    vec2 stretchedPixel = toPixel * vec2(0.7, 1.0);
                    float stretchedAngle = atan(stretchedPixel.y, stretchedPixel.x);
                    float groundPattern = rayPattern(stretchedAngle, dist);

                    float originFade = smoothstep(0.0, 0.8, dist);
                    float falloff = exp(-dist * 0.5) * smoothstep(4.0, 0.3, abs(world.x - sun.pos.x));
                    // Fade out toward bottom of screen
                    float bottomFade = smoothstep(-2.0, 0.5, world.y);
                    rgb += rayColor * groundPattern * falloff * sun.intersectStrength * shimmer * originFade * bottomFade * 0.7;
                }
                return rgb;
            }

            vec3 applyStars(vec3 rgb, vec2 uv, vec4 baseColor, float starsIntensity) {
                vec2 aspectUV = vec2(uv.x * uAspectRatio, uv.y);
                vec2 starUV = aspectUV + STAR_SPEED * uTime;
                float gridSize = 60.0;
                vec2 cell = floor(starUV * gridSize);
                float r = random(cell);

                if (r > STAR_THRESHOLD) {
                    vec2 cellUV = fract(starUV * gridSize);
                    vec2 starPos = vec2(random(cell + 0.1), random(cell + 0.2));
                    float star = smoothstep(0.12, 0.0, length(cellUV - starPos));
                    float phase = random(cell + 0.3) * 6.28;
                    float speed = 0.3 + random(cell + 0.4) * 0.4;
                    float twinkle = sin(uTime * speed + phase) * 0.15 + 0.85;
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
                float skyBlend = terrainFactor(world);  // Smooth 0-1 transition at terrain edge
                bool inSky = skyBlend > 0.5;

                // Calculate sun position from progress
                // Game waves: 0-0.25=dawn, 0.25-0.5=day, 0.5-0.75=dusk, 0.75-1=night
                // We want: end of dawn (0.25) = sun at intersection
                //          start of dusk (0.5) = sun at intersection
                float sunProgress = 0.29 + (uDayNightProgress - 0.25) * 1.68;
                bool sunVisible = sunProgress >= 0.0 && sunProgress <= 1.0;

                // Get sun data (clamp to valid range)
                SunData sun = getSunDataFromProgress(clamp(sunProgress, 0.0, 1.0));

                // Get ambiance based on sun position
                // Always use sun-based ambiance - it handles below-horizon naturally
                Ambiance ambiance = getAmbianceFromSun(sun.top, sun.bottom, sun.terrainY, sun.intersectStrength);
                ambiance.sunProgress = sunProgress;

                // Sky detection
                float blueness = color.b - max(color.r, color.g);
                float skyFactor = smoothstep(-0.08, 0.15, blueness);

                // Base color with darkness and tint
                float darkness = min(ambiance.darkness + skyFactor * SKY_EXTRA_DARKNESS, MAX_DARKNESS);
                vec3 rgb = color.rgb * (1.0 - darkness);
                rgb = mix(rgb, rgb * ambiance.tintColor, ambiance.tintStrength);

                // Sun effects
                if (sunVisible) {
                    if (blueness > 0.0) {
                        rgb = applyGoldenHour(rgb, sun.pos.y, sunProgress);
                    }
                    // Use skyBlend for smooth sun disc transition at horizon
                    vec3 sunDiscEffect = applySunDisc(vec3(0.0), vTexCoord, sun, sunProgress);
                    rgb += sunDiscEffect * skyBlend;

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
                rgb = debugSunPath(rgb, world, sunProgress);
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
