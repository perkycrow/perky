import RenderPass from '../../render/postprocessing/render_pass.js'


export default class GroundPass extends RenderPass {

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
            precision highp float;

            uniform sampler2D uTexture;
            uniform vec2 uCameraPos;
            uniform vec2 uResolution;
            uniform float uPixelsPerUnit;
            uniform float uTileSize;
            uniform float uTime;

            in vec2 vTexCoord;
            out vec4 fragColor;

            // Colors
            const vec3 COLOR_LIGHT = vec3(0.68, 0.66, 0.64);
            const vec3 COLOR_DARK = vec3(0.52, 0.50, 0.48);

            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }

            vec2 hash2(vec2 p) {
                return vec2(
                    fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453),
                    fract(sin(dot(p, vec2(269.5, 183.3))) * 43758.5453)
                );
            }

            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }

            // Check if a tile should be "light" (the puffy squares)
            bool isLightTile(vec2 tileIndex) {
                return mod(tileIndex.x + tileIndex.y, 2.0) < 0.5;
            }

            // Distance to a curly tendril path
            float curlTendril(vec2 p, vec2 tileIndex, int tendrilId) {
                vec2 seed = tileIndex + vec2(float(tendrilId) * 7.77, float(tendrilId) * 3.33);

                // Starting direction from tile edge
                float startAngle = hash(seed) * 6.28;
                vec2 startDir = vec2(cos(startAngle), sin(startAngle));

                // Start position at edge of tile (radius ~0.5)
                vec2 startPos = startDir * 0.48;

                // Tendril properties - thin crack-like
                float totalLength = 0.15 + hash(seed * 1.1) * 0.2;
                float baseWidth = 0.015 + hash(seed * 2.2) * 0.01;
                float curliness = 1.0 + hash(seed * 3.3) * 1.5;
                float curlFreq = 3.0 + hash(seed * 4.4) * 2.0;

                // March along the tendril and find closest point
                float minDist = 1.0;
                vec2 pos = startPos;

                for (int step = 0; step < 30; step++) {
                    float t = float(step) / 29.0;

                    // Curl the direction as we go outward
                    float curlAngle = startAngle + sin(t * curlFreq + hash(seed * 5.5) * 6.28) * curliness * t;
                    vec2 dir = vec2(cos(curlAngle), sin(curlAngle));

                    // Width tapers toward tip
                    float width = baseWidth * (1.0 - t * 0.8);

                    // Distance from query point to this segment
                    float d = length(p - pos) - width;
                    minDist = min(minDist, d);

                    // Move along path
                    float stepSize = totalLength / 29.0;
                    pos += dir * stepSize;
                }

                return minDist;
            }

            // Tendril extensions from tile edges
            float tendrilDistance(vec2 localPos, vec2 tileIndex) {
                vec2 p = localPos - 0.5;

                // Determine if this tile has tendrils
                float damageLevel = hash(tileIndex * 3.33);
                if (damageLevel < 0.5) return 1.0;

                float minDist = 1.0;
                int numTendrils = 2 + int(hash(tileIndex * 4.44) * 3.0);

                for (int i = 0; i < 4; i++) {
                    if (i >= numTendrils) break;
                    float d = curlTendril(p, tileIndex, i);
                    minDist = min(minDist, d);
                }

                return minDist;
            }

            // Distance to a puffy square blob with subtle imperfections
            float blobDistance(vec2 localPos, vec2 tileIndex) {
                vec2 p = localPos - 0.5;

                // Squircle - sweet spot for slight corner rounding
                float squareness = 12.0;
                float baseDist = pow(pow(abs(p.x), squareness) + pow(abs(p.y), squareness), 1.0 / squareness);

                // Size - slightly overflow into dark tiles
                float size = 0.51 + hash(tileIndex) * 0.01;

                // Subtle edge wobble
                float angle = atan(p.y, p.x);
                float wobble = 0.0;
                wobble += sin(angle * 8.0 + hash(tileIndex * 1.1) * 6.28) * 0.004;
                wobble += sin(angle * 13.0 + hash(tileIndex * 2.2) * 6.28) * 0.003;
                wobble += (noise(tileIndex * 2.0 + vec2(cos(angle), sin(angle)) * 0.5) - 0.5) * 0.008;

                float blobDist = baseDist - size - wobble;

                // Combine with tendrils
                float tendrilDist = tendrilDistance(localPos, tileIndex);

                return min(blobDist, tendrilDist);
            }

            // Paint splatters
            float splatter(vec2 worldPos, out float grayBlend) {
                float result = 0.0;
                grayBlend = 0.5;

                // Multiple scales of splatters
                for (int layer = 0; layer < 3; layer++) {
                    float scale = 8.0 + float(layer) * 6.0;
                    vec2 p = worldPos * scale;
                    vec2 cellId = floor(p);
                    vec2 cellUv = fract(p);

                    for (int y = -1; y <= 1; y++) {
                        for (int x = -1; x <= 1; x++) {
                            vec2 offset = vec2(float(x), float(y));
                            vec2 cell = cellId + offset;

                            float chance = hash(cell * 0.31 + float(layer) * 100.0);
                            if (chance < 0.88) continue;

                            vec2 center = hash2(cell * 1.7);
                            vec2 diff = offset + center - cellUv;

                            // Blobby shape
                            float angle = atan(diff.y, diff.x);
                            float shapeVar = 0.8 + 0.2 * sin(angle * 3.0 + hash(cell) * 6.28);
                            shapeVar *= 0.9 + 0.1 * sin(angle * 5.0 + hash(cell * 2.0) * 6.28);
                            float dist = length(diff) / shapeVar;

                            float radius = 0.15 + hash(cell * 2.3) * 0.2;
                            float blob = 1.0 - smoothstep(radius * 0.5, radius, dist);

                            if (blob > result) {
                                result = blob;
                                grayBlend = hash(cell * 3.7);
                            }
                        }
                    }
                }

                return result;
            }

            void main() {
                vec2 screenCenter = uResolution * 0.5;
                vec2 pixelPos = vTexCoord * uResolution;
                vec2 worldPos = uCameraPos + (pixelPos - screenCenter) / uPixelsPerUnit;

                // Tile coordinates
                vec2 tilePos = worldPos / uTileSize;
                vec2 tileIndex = floor(tilePos);
                vec2 tileLocal = fract(tilePos);

                // Start with dark background
                vec3 baseColor = COLOR_DARK;
                float variation = hash(tileIndex * 1.1) * 0.03 - 0.015;
                baseColor += variation;

                // Check current and neighboring tiles for light blobs
                float minDist = 1.0;
                vec2 closestLightTile = tileIndex;

                for (int dy = -1; dy <= 1; dy++) {
                    for (int dx = -1; dx <= 1; dx++) {
                        vec2 neighbor = tileIndex + vec2(float(dx), float(dy));

                        if (isLightTile(neighbor)) {
                            vec2 localInNeighbor = tileLocal - vec2(float(dx), float(dy));
                            float d = blobDistance(localInNeighbor, neighbor);

                            if (d < minDist) {
                                minDist = d;
                                closestLightTile = neighbor;
                            }
                        }
                    }
                }

                // Smooth transition between light and dark tiles
                float pixelSize = 1.0 / uPixelsPerUnit;
                float edgeSmooth = pixelSize * 1.5; // Smooth over ~1.5 pixels
                float lightBlend = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, minDist);

                vec3 darkColor = COLOR_DARK + hash(tileIndex * 1.1) * 0.03 - 0.015;
                vec3 lightColor = COLOR_LIGHT + hash(closestLightTile * 2.2) * 0.03 - 0.015;
                baseColor = mix(darkColor, lightColor, lightBlend);

                // Paint splatters
                float grayBlend;
                float splatIntensity = splatter(worldPos, grayBlend);
                if (splatIntensity > 0.0) {
                    vec3 splatColor = mix(COLOR_DARK - 0.03, COLOR_LIGHT + 0.03, grayBlend);
                    baseColor = mix(baseColor, splatColor, splatIntensity * 0.6);
                }

                // Composite with scene
                vec4 sceneColor = texture(uTexture, vTexCoord);
                fragColor = vec4(mix(baseColor, sceneColor.rgb, sceneColor.a), 1.0);
            }
        `,
        uniforms: ['uTexture', 'uCameraPos', 'uResolution', 'uPixelsPerUnit', 'uTileSize', 'uTime'],
        attributes: ['aPosition', 'aTexCoord']
    }

    static defaultUniforms = {
        uCameraPos: [0.0, 0.0],
        uResolution: [800.0, 600.0],
        uPixelsPerUnit: 100.0,
        uTileSize: 1.0,
        uTime: 0.0
    }

}
