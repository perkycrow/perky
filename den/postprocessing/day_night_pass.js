import RenderPass from '../../render/postprocessing/render_pass.js'


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
            uniform float uAspectRatio;
            in vec2 vTexCoord;
            out vec4 fragColor;

            // ─────────────────────────────────────────────────────────────
            // Constants
            // ─────────────────────────────────────────────────────────────
            const float PI = 3.14159265;
            const vec2 WORLD_SIZE = vec2(7.0, 5.0);
            const vec2 SUN_ARC = vec2(2.95, 2.325);
            const float SUN_RADIUS = 0.15;
            // Terrain hills (fixed geometry)
            const vec2 HILL1 = vec2(-4.5, -20.68);
            const float HILL1_R = 22.65;
            const vec2 HILL2 = vec2(3.55, -14.0);
            const float HILL2_R = 15.95;
            const float CAMERA_RATIO = 1.4;
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
            const vec3 TINT_NIGHT = vec3(0.5, 0.65, 1.0);
            const float DARK_NIGHT = 0.2;  // Reduced - we use color shift instead
            const float TINT_STR_NIGHT = 0.35;
            const float STARS_NIGHT = 1.2;

            // Purkinje effect: night vision shifts sensitivity toward blue-green
            const vec3 PURKINJE_WEIGHTS = vec3(0.1, 0.5, 0.4);
            const float PURKINJE_STRENGTH = 0.4;

            // Selective desaturation: warm colors fade more at night
            const float DESAT_WARM = 0.6;   // How much to desaturate reds/oranges
            const float DESAT_COOL = 0.1;   // Keep blues/greens more vivid

            // Dawn: warm golden/orange sunrise
            const vec3 TINT_DAWN = vec3(1.0, 0.8, 0.6);
            const float DARK_DAWN = 0.1;
            const float TINT_STR_DAWN = 0.45;

            // Dusk: cool purple/pink sunset
            const vec3 TINT_DUSK = vec3(0.9, 0.6, 0.8);
            const float DARK_DUSK = 0.15;
            const float TINT_STR_DUSK = 0.5;

            // Rays dawn: golden orange rays
            const vec3 TINT_RAYS_DAWN = vec3(1.0, 0.7, 0.4);
            const float DARK_RAYS = 0.05;
            const float TINT_STR_RAYS = 0.55;

            // Rays dusk: purple/magenta rays
            const vec3 TINT_RAYS_DUSK = vec3(0.95, 0.5, 0.6);

            // Day: sun fully in sky
            const vec3 TINT_DAY = vec3(1.0, 1.0, 1.0);
            const float DARK_DAY = 0.0;
            const float TINT_STR_DAY = 0.0;

            // How far above/below terrain for horizon effect (smaller = faster transition to day)
            const float HORIZON_RANGE = 0.4;

            // Sun disc/halo - stylized illustrative style
            const float SUN_DISC_SIZE = 0.035;        // Size of solid sun disc
            const float SUN_DISC_EDGE = 0.006;        // Soft edge thickness (larger = softer)
            const float HALO_SIZE = 0.010;            // Halo extends this far beyond disc
            const float HALO_STRENGTH = 0.2;          // Halo opacity

            // Stars
            const float STAR_GRID_SIZE = 60.0;
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
            // Coordinate transforms
            // ─────────────────────────────────────────────────────────────
            void getScreenWorldParams(out vec2 margin, out vec2 scale) {
                float ratio = uAspectRatio / CAMERA_RATIO;
                float wider = step(CAMERA_RATIO, uAspectRatio);  // 1 if wider, 0 if taller
                float taller = 1.0 - wider;
                margin = vec2(
                    wider * (1.0 - 1.0/ratio) * 0.5,
                    taller * (1.0 - ratio) * 0.5
                );
                scale = vec2(
                    mix(1.0, ratio, wider),
                    mix(1.0, 1.0/ratio, taller)
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
                return max(hillHeight(HILL1, HILL1_R, x), hillHeight(HILL2, HILL2_R, x));
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
                float intersectStrength;  // 0 when not intersecting, 0-1 when intersecting
                float duskFactor;         // 0=dawn, 1=dusk - precomputed for reuse
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
                // Branchless intersection strength calculation
                // Returns 0 when not intersecting, 0-1 based on overlap depth
                float belowTerrain = s.terrainY - s.bottom;  // How far bottom is below terrain
                float aboveTerrain = s.top - s.terrainY;     // How far top is above terrain
                float isIntersecting = step(0.0, belowTerrain) * step(0.0, aboveTerrain);
                s.intersectStrength = min(belowTerrain, aboveTerrain) / SUN_RADIUS * isIntersecting;
                // Precompute dusk factor (0=dawn, 1=dusk) - reused in ambiance and sun disc
                s.duskFactor = smoothstep(0.35, 0.65, progress);
                return s;
            }

            // ─────────────────────────────────────────────────────────────
            // Ambiance calculations (based on sun position, not time!)
            // ─────────────────────────────────────────────────────────────

            struct Ambiance {
                float darkness;
                float tintStrength;
                vec3 tintColor;
                float starsIntensity;
                float nightFactor;  // 0=day, 1=full night - for Purkinje/desat effects
            };

            // Calculate ambiance from sun position relative to terrain
            // Uses precomputed SunData for efficiency
            Ambiance getAmbianceFromSun(SunData sun) {
                Ambiance a;

                // Sun position relative to terrain
                float aboveTerrain = sun.bottom - sun.terrainY;  // positive = fully in sky
                float belowTerrain = sun.terrainY - sun.top;     // positive = fully below

                // Smooth blend factors
                float nightFactor = smoothstep(0.0, HORIZON_RANGE, belowTerrain);
                float dayFactor = smoothstep(0.0, HORIZON_RANGE, aboveTerrain);
                float raysFactor = sun.intersectStrength;

                // Interpolate horizon colors between dawn and dusk (use precomputed duskFactor)
                vec3 horizonTint = mix(TINT_DAWN, TINT_DUSK, sun.duskFactor);
                float horizonDark = mix(DARK_DAWN, DARK_DUSK, sun.duskFactor);
                float horizonTintStr = mix(TINT_STR_DAWN, TINT_STR_DUSK, sun.duskFactor);

                // Mix ambiance based on sun state
                // Start with night/day/horizon blend
                a.tintColor = mix(
                    mix(horizonTint, TINT_NIGHT, nightFactor),
                    TINT_DAY,
                    dayFactor
                );
                a.darkness = mix(
                    mix(horizonDark, DARK_NIGHT, nightFactor),
                    DARK_DAY,
                    dayFactor
                );
                a.tintStrength = mix(
                    mix(horizonTintStr, TINT_STR_NIGHT, nightFactor),
                    TINT_STR_DAY,
                    dayFactor
                );

                // Override with rays ambiance when sun intersects terrain
                vec3 raysTint = mix(TINT_RAYS_DAWN, TINT_RAYS_DUSK, sun.duskFactor);
                a.tintColor = mix(a.tintColor, raysTint, raysFactor);
                a.darkness = mix(a.darkness, DARK_RAYS, raysFactor);
                a.tintStrength = mix(a.tintStrength, TINT_STR_RAYS, raysFactor);

                // Stars only at night
                a.starsIntensity = STARS_NIGHT * nightFactor;

                // Export night factor for Purkinje/desaturation effects
                a.nightFactor = nightFactor;

                return a;
            }

            // ─────────────────────────────────────────────────────────────
            // Color utilities
            // ─────────────────────────────────────────────────────────────
            // Attempt branchless HSL conversion - IQ style
            // HSV to RGB is cheaper and similar for our use case (night desaturation)
            vec3 rgbToHsv(vec3 c) {
                vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
                vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
                vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
                float d = q.x - min(q.w, q.y);
                float e = 1.0e-10;
                return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
            }

            vec3 hsvToRgb(vec3 c) {
                vec3 p = abs(fract(c.xxx + vec3(1.0, 2.0/3.0, 1.0/3.0)) * 6.0 - 3.0);
                return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
            }

            // Apply Purkinje shift: boost blue-green perception at night
            vec3 applyPurkinje(vec3 rgb, float nightFactor) {
                float lum = dot(rgb, vec3(0.299, 0.587, 0.114));
                float purkinjeL = dot(rgb, PURKINJE_WEIGHTS);
                float shiftedL = mix(lum, purkinjeL, nightFactor * PURKINJE_STRENGTH);
                // Preserve relative color but shift luminance perception
                vec3 normalized = rgb / max(lum, 0.001);
                return normalized * shiftedL;
            }

            // Selective desaturation: warm colors lose saturation at night
            vec3 applyNightDesaturation(vec3 rgb, float nightFactor) {
                vec3 hsv = rgbToHsv(rgb);
                // Hue 0-0.15 = red/orange (warm), 0.5-0.7 = blue/cyan (cool)
                float warmness = 1.0 - smoothstep(0.0, 0.2, hsv.x) * smoothstep(0.5, 0.15, hsv.x);
                // More desaturation for warm colors
                float desat = mix(DESAT_COOL, DESAT_WARM, warmness);
                hsv.y *= 1.0 - desat * nightFactor;
                return hsvToRgb(hsv);
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

                // Defined sun disc with soft edge
                float disc = 1.0 - smoothstep(SUN_DISC_SIZE - SUN_DISC_EDGE, SUN_DISC_SIZE, d);

                // Halo: smooth gradient fade (no hard edge)
                float haloEnd = SUN_DISC_SIZE + HALO_SIZE;
                float halo = smoothstep(haloEnd, SUN_DISC_SIZE, d) * HALO_STRENGTH;
                halo *= (1.0 - disc);
                // Fade halo when sun leaves intersection
                halo *= sun.intersectStrength;

                // Dawn vs Dusk color tinting (use precomputed duskFactor)
                vec3 dawnTint = vec3(1.0, 0.85, 0.6);   // Warm orange-yellow
                vec3 duskTint = vec3(1.0, 0.7, 0.75);   // Soft pink-orange

                // Low sun = more tinted, high sun = whiter
                float lowSunFactor = 1.0 - smoothstep(0.0, 1.2, sun.pos.y);
                vec3 horizonTint = mix(dawnTint, duskTint, sun.duskFactor);

                // Apply tint based on sun height
                vec3 discColor = mix(sun.color, horizonTint, lowSunFactor * 0.5);
                vec3 haloColor = mix(sun.color, horizonTint, lowSunFactor * 0.7);

                // Reduce intensity - sun should be visible but not glaring
                discColor *= 0.7;
                haloColor *= 0.6;

                // Fade effects at sunrise/sunset edges
                float edgeFade = smoothstep(0.0, 0.15, sunProgress) * smoothstep(1.0, 0.85, sunProgress);

                // Combine: solid disc + attached halo glow
                vec3 result = discColor * disc + haloColor * halo;
                return rgb + result * edgeFade;
            }

            vec3 applyRays(vec3 rgb, vec2 world, SunData sun, float skyBlend) {
                vec2 rayOrigin = vec2(sun.pos.x, sun.terrainY);
                vec2 toPixel = world - rayOrigin;
                float dist = length(toPixel);
                float angle = atan(toPixel.y, toPixel.x);

                // Warm color for rays
                float lowSunFactor = 1.0 - smoothstep(0.0, 1.5, sun.pos.y);
                vec3 rayColor = mix(sun.color, vec3(1.0, 0.7, 0.5), lowSunFactor * 0.4);

                // Subtle shimmer based on progress
                float shimmer = sin(uDayNightProgress * 50.0) * 0.05 + 0.95;

                // === Sky rays ===
                float upwardBias = smoothstep(-0.3, 1.0, toPixel.y / max(dist, 0.01));
                float skyAtmoFalloff = exp(-dist * 0.6) * smoothstep(0.0, 0.4, dist);
                float skyAtmoGlow = skyAtmoFalloff * upwardBias * 0.25;
                float pattern = rayPattern(angle, dist);
                float skyRayFalloff = exp(-dist * 0.5) * smoothstep(0.1, 0.5, dist);
                float skyStylizedRays = pattern * skyRayFalloff * upwardBias * 0.4;
                float skyCombined = (skyAtmoGlow + skyStylizedRays) * sun.intersectStrength * shimmer;

                // === Ground rays ===
                vec2 stretchedPixel = toPixel * vec2(0.6, 1.0);
                float stretchedAngle = atan(stretchedPixel.y, stretchedPixel.x);
                float radialFade = smoothstep(4.0, 0.0, abs(world.x - sun.pos.x));
                float groundAtmoGlow = exp(-dist * 0.4) * radialFade * 0.2;
                float groundPattern = rayPattern(stretchedAngle, dist);
                float groundStylizedRays = groundPattern * exp(-dist * 0.5) * radialFade * 0.1;
                float bottomFade = smoothstep(-1.5, 0.8, world.y);
                float groundCombined = (groundAtmoGlow + groundStylizedRays) * sun.intersectStrength * shimmer * bottomFade;

                // Blend sky and ground contributions
                float combined = mix(groundCombined, skyCombined, skyBlend);
                vec3 glowColor = rayColor * combined;

                // Soft screen-ish blend (works for both, slightly stronger on ground)
                float screenFactor = mix(0.3, 0.0, skyBlend);
                return rgb + glowColor * (1.0 - rgb * screenFactor);
            }

            vec3 applyStars(vec3 rgb, vec2 uv, float baseLum, float starsIntensity) {
                vec2 aspectUV = vec2(uv.x * uAspectRatio, uv.y);
                // Slow drift based on progress
                vec2 starUV = aspectUV + vec2(0.008, 0.003) * uDayNightProgress * 100.0;
                vec2 gridUV = starUV * STAR_GRID_SIZE;
                vec2 cell = floor(gridUV);

                // Single random call, derive others with cheap ops (IQ technique)
                float rBase = random(cell);
                float isStar = step(STAR_THRESHOLD, rBase);

                vec2 cellUV = fract(gridUV);
                // Derive star position from base random using fract arithmetic
                vec2 starPos = fract(vec2(rBase * 17.31, rBase * 43.17));
                float star = smoothstep(0.12, 0.0, length(cellUV - starPos));

                // Twinkle: derive phase and speed from rBase
                float phase = fract(rBase * 127.1) * 6.28;
                float speed = 0.3 + fract(rBase * 311.7) * 0.4;
                float twinkle = sin(uDayNightProgress * speed * 100.0 + phase) * 0.15 + 0.85;

                rgb += vec3(starsIntensity * star * twinkle * smoothstep(0.5, 1.0, baseLum) * isStar);

                return rgb;
            }

            // ─────────────────────────────────────────────────────────────
            // Debug visualization
            // ─────────────────────────────────────────────────────────────
            #ifdef DEBUG_HILLS
            vec3 debugHills(vec3 rgb, vec2 world) {
                float d1 = length(world - HILL1);
                float d2 = length(world - HILL2);
                if (d1 < HILL1_R) rgb = mix(rgb, vec3(1.0, 0.0, 0.0), 0.3);
                if (d2 < HILL2_R) rgb = mix(rgb, vec3(0.0, 0.0, 1.0), 0.3);
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
                if (sun.intersectStrength > 0.0 && abs(world.x - sun.pos.x) < 0.01 && world.y > sun.terrainY && world.y < sun.terrainY + 0.02) return vec3(1.0);
                return rgb;
            }
            #endif

            #ifdef DEBUG_SUN_PATH
            vec3 debugSunPath(vec3 rgb, vec2 world, float sunProgress) {
                float minDist = 1000.0;

                // Sample trajectory to find closest point
                for (float p = 0.0; p <= 1.0; p += 0.01) {
                    vec2 sunPos = calcSunPos(p);
                    float d = length(world - sunPos);
                    if (d < minDist) {
                        minDist = d;
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
                float skyBlend = terrainFactor(world);  // Smooth 0-1 transition at terrain edge

                // Calculate sun position from progress
                // Game waves: 0-0.25=dawn, 0.25-0.5=day, 0.5-0.75=dusk, 0.75-1=night
                // We want: end of dawn (0.25) = sun at intersection
                //          start of dusk (0.5) = sun at intersection
                float sunProgress = 0.29 + (uDayNightProgress - 0.25) * 1.68;
                float clampedSunProgress = clamp(sunProgress, 0.0, 1.0);

                // Get sun data (clamp to valid range)
                SunData sun = getSunDataFromProgress(clampedSunProgress);

                // Get ambiance based on sun position
                // Always use sun-based ambiance - it handles below-horizon naturally
                Ambiance ambiance = getAmbianceFromSun(sun);

                // Sky detection
                float blueness = color.b - max(color.r, color.g);
                float skyFactor = smoothstep(-0.08, 0.15, blueness);

                // Sprite protection: reduce ambiance effects on non-sky elements
                // skyFactor ~1 for sky, ~0 for sprites/characters
                float spriteProtection = 1.0 - skyFactor;
                float effectStrength = 1.0 - spriteProtection * 0.6; // sprites get ~40% of the effect

                // Start with original color
                vec3 rgb = color.rgb;

                // Apply night vision effects (Purkinje + selective desaturation)
                // nightFactor naturally fades to 0 during day, no branch needed
                float nightEffect = ambiance.nightFactor * effectStrength;
                rgb = applyPurkinje(rgb, nightEffect);
                rgb = applyNightDesaturation(rgb, nightEffect);

                // Apply reduced darkness (contrast preservation)
                // Sprites receive less darkness to stay readable
                float baseDarkness = ambiance.darkness * effectStrength;
                float darkness = min(baseDarkness + skyFactor * SKY_EXTRA_DARKNESS, MAX_DARKNESS);
                rgb *= (1.0 - darkness);

                // Apply color tint (reduced on sprites)
                float tintStrength = ambiance.tintStrength * effectStrength;
                rgb = mix(rgb, rgb * ambiance.tintColor, tintStrength);

                // Sun effects - use sunVisibleFactor instead of branch
                float sunVisibleFactor = step(0.0, sunProgress) * step(sunProgress, 1.0);

                // Golden hour - multiply by sky factor (blueness > 0 means sky)
                float skyness = step(0.0, blueness);
                vec3 goldenRgb = applyGoldenHour(rgb, sun.pos.y, sunProgress);
                rgb = mix(rgb, goldenRgb, skyness * sunVisibleFactor);

                // Sun disc - already uses skyBlend for smooth transition
                vec3 sunDiscEffect = applySunDisc(vec3(0.0), vTexCoord, sun, sunProgress);
                rgb += sunDiscEffect * skyBlend * sunVisibleFactor;

                // Rays - intersectStrength naturally fades to 0 when not intersecting
                rgb = applyRays(rgb, world, sun, skyBlend);

                #ifdef DEBUG_SUN_RADIUS
                rgb = debugSun(rgb, world, sun);
                #endif

                #ifdef DEBUG_HILLS
                rgb = debugHills(rgb, world);
                #endif

                #ifdef DEBUG_SUN_PATH
                rgb = debugSunPath(rgb, world, sunProgress);
                #endif

                // Stars - starsIntensity fades to 0 during day, skyBlend handles terrain
                // No branch needed, just multiply by all factors
                float starsFactor = step(0.0, blueness) * ambiance.starsIntensity * skyBlend;
                float baseLum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                rgb = applyStars(rgb, vTexCoord, baseLum, starsFactor);

                fragColor = vec4(clamp(rgb, 0.0, 1.0), color.a);
            }
        `,
        uniforms: ['uTexture', 'uDayNightProgress', 'uAspectRatio'],
        attributes: ['aPosition', 'aTexCoord']
    }

    static defaultUniforms = {
        uDayNightProgress: 0.0,
        uAspectRatio: 1.0
    }

    static uniformConfig = {
        uDayNightProgress: {min: 0, max: 1, step: 0.01}
    }

    setProgress (progress) {

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


    static getShadowParams (progress) {

        const p = ((progress % 1) + 1) % 1
        const sunProgress = 0.29 + (p - 0.25) * 1.68


        if (sunProgress < 0 || sunProgress > 1) {
            return {skewX: 0, scaleY: -0.3, offsetY: 0, color: [0, 0, 0, 0.1]}
        }


        const angle = sunProgress * Math.PI
        const sunX = -Math.cos(angle) * 2.95
        const sunY = Math.sin(angle) * 2.325

        return {
            skewX: -sunX * 0.25,
            scaleY: -0.2 - sunY * 0.12,
            offsetY: 0,
            color: [0, 0, 0, 0.1 + sunY * 0.1]
        }
    }

}
