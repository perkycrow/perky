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
            uniform float uSunProgress;
            uniform float uAspectRatio;
            uniform vec2 uHill1;
            uniform float uHill1R;
            uniform vec2 uHill2;
            uniform float uHill2R;
            uniform float uCameraRatio;
            in vec2 vTexCoord;
            out vec4 fragColor;

            const float WORLD_WIDTH = 7.0;
            const float WORLD_HEIGHT = 5.0;
            const float SUN_RADIUS = 0.45;
            const float PI = 3.14159265;

            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }

            // Convert screen UV to world coordinates
            vec2 screenToWorld(vec2 screenUV) {
                vec2 gameUV;
                if (uAspectRatio > uCameraRatio) {
                    float gameWidthRatio = uCameraRatio / uAspectRatio;
                    float marginX = (1.0 - gameWidthRatio) * 0.5;
                    gameUV = vec2((screenUV.x - marginX) / gameWidthRatio, screenUV.y);
                } else {
                    float gameHeightRatio = uAspectRatio / uCameraRatio;
                    float marginY = (1.0 - gameHeightRatio) * 0.5;
                    gameUV = vec2(screenUV.x, (screenUV.y - marginY) / gameHeightRatio);
                }
                return (gameUV - 0.5) * vec2(WORLD_WIDTH, WORLD_HEIGHT);
            }

            // Convert world coordinates to screen UV
            vec2 worldToScreen(vec2 world) {
                vec2 gameUV = world / vec2(WORLD_WIDTH, WORLD_HEIGHT) + 0.5;
                if (uAspectRatio > uCameraRatio) {
                    float gameWidthRatio = uCameraRatio / uAspectRatio;
                    float marginX = (1.0 - gameWidthRatio) * 0.5;
                    return vec2(gameUV.x * gameWidthRatio + marginX, gameUV.y);
                } else {
                    float gameHeightRatio = uAspectRatio / uCameraRatio;
                    float marginY = (1.0 - gameHeightRatio) * 0.5;
                    return vec2(gameUV.x, gameUV.y * gameHeightRatio + marginY);
                }
            }

            // Get terrain height at world X position (top of hills)
            float terrainHeight(float worldX) {
                float dx1 = worldX - uHill1.x;
                float dx2 = worldX - uHill2.x;
                float r1sq = uHill1R * uHill1R;
                float r2sq = uHill2R * uHill2R;
                float h1 = (dx1*dx1 < r1sq) ? uHill1.y + sqrt(r1sq - dx1*dx1) : -999.0;
                float h2 = (dx2*dx2 < r2sq) ? uHill2.y + sqrt(r2sq - dx2*dx2) : -999.0;
                return max(h1, h2);
            }

            // Sun position from progress (0 = left horizon, 0.5 = zenith, 1 = right horizon)
            vec2 sunPosition(float progress) {
                float angle = progress * PI;
                float x = cos(angle) * 3.0;
                float y = sin(angle) * 2.5;
                return vec2(x, y);
            }

            // Sun color based on height (golden at horizon, white at zenith)
            vec3 sunColor(float sunY) {
                float horizonFactor = 1.0 - smoothstep(0.3, 1.5, sunY);
                return mix(vec3(1.0, 0.95, 0.85), vec3(1.0, 0.5, 0.2), horizonFactor);
            }

            void main() {
                vec4 color = texture(uTexture, vTexCoord);
                vec2 world = screenToWorld(vTexCoord);
                float terrain = terrainHeight(world.x);
                bool inSky = world.y > terrain;

                float blueness = color.b - max(color.r, color.g);
                float skyFactor = smoothstep(-0.08, 0.15, blueness);
                float skyDarkening = min(uDarkness + skyFactor * 0.35, 0.85);

                vec3 rgb = color.rgb * (1.0 - skyDarkening);
                rgb = mix(rgb, rgb * uTintColor, uTintStrength);

                float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));

                // Sun calculations
                bool sunVisible = uSunProgress > 0.0 && uSunProgress < 1.0;
                vec2 sun = sunPosition(uSunProgress);
                float sunTerrain = terrainHeight(sun.x);
                vec3 sColor = sunColor(sun.y);

                // Golden hour tint
                if (blueness > 0.0 && sunVisible) {
                    float goldenFactor = 1.0 - smoothstep(0.3, 1.5, sun.y);
                    vec3 goldenTint = mix(vec3(1.0), vec3(1.0, 0.75, 0.55), goldenFactor * 0.4);
                    rgb *= goldenTint;
                }

                // Sun disc, ring, halo
                if (sunVisible && inSky) {
                    vec2 sunScreen = worldToScreen(sun);
                    vec2 diff = vTexCoord - sunScreen;
                    diff.x *= uAspectRatio;
                    float dist = length(diff);

                    float disc = smoothstep(0.03, 0.025, dist);
                    float ring = smoothstep(0.038, 0.033, dist) - disc;
                    float halo = smoothstep(0.08, 0.03, dist) * 0.25;

                    rgb += sColor * disc * skyFactor;
                    rgb += sColor * ring * 0.6 * skyFactor;
                    rgb += sColor * halo * skyFactor;
                }

                // Sun rays
                if (sunVisible) {
                    // Check sun-terrain intersection
                    float sunTop = sun.y + SUN_RADIUS;
                    float sunBottom = sun.y - SUN_RADIUS;
                    bool sunIntersectsTerrain = (sunBottom < sunTerrain) && (sunTop > sunTerrain);

                    // Intersection strength (how much sun is at horizon)
                    float amountBehind = clamp(sunTerrain - sunBottom, 0.0, SUN_RADIUS * 2.0);
                    float amountVisible = clamp(sunTop - sunTerrain, 0.0, SUN_RADIUS * 2.0);
                    float intersectStrength = sunIntersectsTerrain ? min(amountBehind, amountVisible) / SUN_RADIUS : 0.0;

                    // Ray origin at terrain intersection point
                    vec2 rayOrigin = vec2(sun.x, sunTerrain);

                    // Ray pattern (animated)
                    float angleOffset = uTime * 0.015;
                    float shimmer = sin(uTime * 0.5) * 0.15 + 0.85;

                    vec2 toPixel = world - rayOrigin;
                    float dist = length(toPixel);
                    float angle = atan(toPixel.y, toPixel.x);

                    float sharpness = mix(3.0, 1.5, smoothstep(0.0, 2.0, dist));
                    float rays1 = pow(abs(sin(angle * 6.0 + angleOffset)), sharpness);
                    float rays2 = pow(abs(sin(angle * 9.0 + 2.0 - angleOffset * 0.6)), sharpness);
                    float rayPattern = (rays1 + rays2) * 0.4;

                    // Sky rays (above terrain, when sun intersects horizon)
                    if (inSky && sunIntersectsTerrain) {
                        float falloff = exp(-dist * 0.8);
                        float mask = smoothstep(0.15, 0.5, dist);
                        float rays = rayPattern * falloff * mask * intersectStrength * shimmer * 2.0;
                        rgb += sColor * rays;
                    }

                    // Ground rays (below terrain line, spreading from intersection)
                    if (!inSky && sunIntersectsTerrain && terrain > -900.0) {
                        vec2 dirFromSun = world - sun;
                        float angleFromSun = atan(dirFromSun.y, dirFromSun.x);

                        float groundRays1 = pow(abs(sin(angleFromSun * 6.0 + angleOffset)), sharpness);
                        float groundRays2 = pow(abs(sin(angleFromSun * 9.0 + 2.0 - angleOffset * 0.6)), sharpness);
                        float groundRayPattern = (groundRays1 + groundRays2) * 0.4;

                        // Distance from terrain edge
                        vec2 rayDir = normalize(dirFromSun);
                        float t = (terrain - sun.y) / rayDir.y;
                        vec2 terrainIntersect = sun + rayDir * t;
                        float distFromEdge = length(world - terrainIntersect);

                        float groundFalloff = exp(-distFromEdge * 0.5);
                        float edgeFade = smoothstep(2.5, 0.2, abs(world.x - sun.x));

                        float groundRays = groundRayPattern * groundFalloff * intersectStrength * shimmer * edgeFade * 1.2;
                        rgb += sColor * groundRays;
                    }
                }

                // Stars
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
                        rgb += vec3(uStarsIntensity * star * twinkle * skyBlend);
                    }
                }

                fragColor = vec4(clamp(rgb, 0.0, 1.0), color.a);
            }
        `,
        uniforms: ['uTexture', 'uDarkness', 'uTintStrength', 'uTintColor', 'uStarsIntensity', 'uStarsThreshold', 'uTime', 'uSunProgress', 'uAspectRatio', 'uHill1', 'uHill1R', 'uHill2', 'uHill2R', 'uCameraRatio'],
        attributes: ['aPosition', 'aTexCoord']
    }

    static defaultUniforms = {
        uDarkness: 0.0,
        uTintStrength: 0.0,
        uTintColor: [0.4, 0.5, 0.8],
        uStarsIntensity: 0.0,
        uStarsThreshold: 0.5,
        uHill1: [-4.5, -20.55],
        uHill1R: 22.5,
        uHill2: [4.25, -17.25],
        uHill2R: 19.25,
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
        uStarsThreshold: {min: 0, max: 1, step: 0.01},
        uTime: {min: 0, max: 100, step: 0.1},
        uSunProgress: {min: -0.5, max: 1.5, step: 0.01},
        uHill1: {type: 'vec2'},
        uHill1R: {min: 0, max: 30, step: 0.1},
        uHill2: {type: 'vec2'},
        uHill2R: {min: 0, max: 30, step: 0.1}
    }


    static phases = {
        night: {
            darkness: 0.4,
            tintStrength: 0.5,
            tintColor: [0.4, 0.5, 0.8],
            starsIntensity: 1.2
        },
        dawn: {
            darkness: 0.08,
            tintStrength: 0.5,
            tintColor: [1.0, 0.65, 0.45],
            starsIntensity: 0.0
        },
        day: {
            darkness: 0.0,
            tintStrength: 0.0,
            tintColor: [1.0, 1.0, 1.0],
            starsIntensity: 0.0
        },
        dusk: {
            darkness: 0.35,
            tintStrength: 0.55,
            tintColor: [1.0, 0.35, 0.25],
            starsIntensity: 0.0
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

        // Sun progress: 0 = rising (left), 0.5 = zenith, 1 = setting (right)
        const sunStart = 0.03
        const sunEnd = 0.60
        let sunProgress
        if (time >= sunStart && time < sunEnd) {
            sunProgress = (time - sunStart) / (sunEnd - sunStart)
        } else {
            sunProgress = -1.0
        }
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

        // Match shader: sun follows arc from left (progress=0) to right (progress=1)
        // angle = progress * PI, so x = cos(angle) * 3, y = sin(angle) * 2.5
        const angle = sunProgress * Math.PI
        const sunX = Math.cos(angle) * 3.0
        const sunY = Math.sin(angle) * 2.5

        // Shadow direction based on sun X position
        const skewX = sunX * 0.25

        // Shadow length based on sun height
        const scaleY = -0.2 - sunY * 0.12

        // Shadow opacity based on sun height
        const alpha = 0.1 + sunY * 0.1

        return {
            skewX,
            scaleY,
            offsetY: 0.06,
            color: [0, 0, 0, alpha]
        }
    }

}
