export const SHADOW_VERTEX = `#version 300 es
in vec2 aPosition;
in vec2 aTexCoord;
in float aOpacity;
in float aFeetY;

uniform mat3 uProjectionMatrix;
uniform mat3 uViewMatrix;
uniform mat3 uModelMatrix;

// Directional mode (sun-like): skewX/scaleY are uniform for all sprites
uniform float uShadowSkewX;
uniform float uShadowScaleY;
uniform float uShadowOffsetY;

// Point light mode: light position, shadow calculated per-sprite
uniform vec2 uLightPosition;
uniform float uLightHeight;
uniform int uShadowMode;  // 0 = directional, 1 = point light

out vec2 vTexCoord;
out float vOpacity;

void main() {
    // aPosition is already in world space from the batch
    // aFeetY is the Y position of the sprite's feet (bottom)

    // Distance from feet (0 at feet, positive going up)
    float distFromFeet = aPosition.y - aFeetY;

    vec2 shadowPos = aPosition;

    if (uShadowMode == 1) {
        // Point light mode: calculate shadow direction per sprite
        // Sprite feet position (approximate center X from current vertex)
        vec2 feetPos = vec2(aPosition.x, aFeetY);

        // Direction from light to sprite feet (on ground plane)
        vec2 lightToFeet = feetPos - uLightPosition;
        float dist = length(lightToFeet);

        // Normalize direction
        vec2 shadowDir = dist > 0.001 ? lightToFeet / dist : vec2(0.0, -1.0);

        // Shadow length based on light height and distance
        // Closer to light = longer shadow, farther = shorter
        float shadowLength = uLightHeight / (dist + 0.5);
        shadowLength = clamp(shadowLength, 0.2, 2.0);

        // Apply shadow projection
        // Skew in the direction away from light
        shadowPos.x += shadowDir.x * distFromFeet * shadowLength;
        shadowPos.y = aFeetY + shadowDir.y * distFromFeet * shadowLength + uShadowOffsetY;
    } else {
        // Directional mode (original behavior)
        shadowPos.x += uShadowSkewX * distFromFeet;
        shadowPos.y = aFeetY + distFromFeet * uShadowScaleY + uShadowOffsetY;
    }

    vec3 worldPos = uModelMatrix * vec3(shadowPos, 1.0);
    vec3 viewPos = uViewMatrix * worldPos;
    vec3 clipPos = uProjectionMatrix * viewPos;

    gl_Position = vec4(clipPos.xy, 0.0, 1.0);
    vTexCoord = aTexCoord;
    vOpacity = aOpacity;
}
`


export const SHADOW_FRAGMENT = `#version 300 es
precision mediump float;

uniform sampler2D uTexture;
uniform vec4 uShadowColor;

in vec2 vTexCoord;
in float vOpacity;

out vec4 fragColor;

void main() {
    vec4 texColor = texture(uTexture, vTexCoord);
    // Use texture alpha but replace color with shadow color
    float alpha = texColor.a * vOpacity * uShadowColor.a;
    fragColor = vec4(uShadowColor.rgb, alpha);
}
`


export const SHADOW_SHADER_DEF = {
    vertex: SHADOW_VERTEX,
    fragment: SHADOW_FRAGMENT,
    uniforms: [
        'uProjectionMatrix',
        'uViewMatrix',
        'uModelMatrix',
        'uShadowSkewX',
        'uShadowScaleY',
        'uShadowOffsetY',
        'uLightPosition',
        'uLightHeight',
        'uShadowMode',
        'uTexture',
        'uShadowColor'
    ],
    attributes: ['aPosition', 'aTexCoord', 'aOpacity', 'aFeetY']
}
