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

            // Hash-based random
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }

            // 2D noise for edge distortion
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

            void main() {
                // Convert screen coords to world coords
                vec2 screenCenter = uResolution * 0.5;
                vec2 pixelPos = vTexCoord * uResolution;
                vec2 worldPos = uCameraPos + (pixelPos - screenCenter) / uPixelsPerUnit;

                // Tile coordinates
                vec2 tilePos = worldPos / uTileSize;
                vec2 tileIndex = floor(tilePos);
                vec2 tileLocal = fract(tilePos);

                // Edge distortion using noise
                float edgeNoise = noise(tileIndex * 3.7) * 0.08;
                vec2 distortedLocal = tileLocal;

                // Distort edges
                float edgeDistX = noise(vec2(tileIndex.x * 5.0, worldPos.y * 2.0)) * edgeNoise;
                float edgeDistY = noise(vec2(worldPos.x * 2.0, tileIndex.y * 5.0)) * edgeNoise;
                distortedLocal.x += edgeDistX * smoothstep(0.0, 0.1, tileLocal.x) * smoothstep(1.0, 0.9, tileLocal.x);
                distortedLocal.y += edgeDistY * smoothstep(0.0, 0.1, tileLocal.y) * smoothstep(1.0, 0.9, tileLocal.y);

                // Recalculate tile after distortion
                vec2 finalTileIndex = floor(tilePos + distortedLocal - tileLocal);

                // Checkerboard pattern
                float checker = mod(finalTileIndex.x + finalTileIndex.y, 2.0);

                // Base colors (two shades of gray)
                vec3 color1 = vec3(0.55, 0.53, 0.51);
                vec3 color2 = vec3(0.45, 0.43, 0.41);

                // Color variation per tile
                float tileVariation = hash(finalTileIndex) * 0.06 - 0.03;

                vec3 baseColor = mix(color1, color2, checker);
                baseColor += tileVariation;

                // White dots/specks
                float dotHash = hash(floor(worldPos * 50.0));
                float dots = step(0.985, dotHash) * 0.4;

                vec3 finalColor = baseColor + dots;

                // Get scene color and composite
                vec4 sceneColor = texture(uTexture, vTexCoord);

                // Ground shows where scene is transparent
                fragColor = vec4(mix(finalColor, sceneColor.rgb, sceneColor.a), 1.0);
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
