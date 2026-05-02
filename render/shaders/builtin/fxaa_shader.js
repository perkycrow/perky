export const FXAA_VERTEX = `#version 300 es
in vec2 aPosition;
in vec2 aTexCoord;
out vec2 vTexCoord;
void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vTexCoord = aTexCoord;
}
`


export const FXAA_FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D uTexture;
uniform vec2 uInverseResolution;
in vec2 vTexCoord;
out vec4 fragColor;

float luminance(vec3 c) {
    return dot(c, vec3(0.299, 0.587, 0.114));
}

void main() {
    vec2 uv = vTexCoord;
    vec2 px = uInverseResolution;

    float lumC = luminance(texture(uTexture, uv).rgb);
    float lumN = luminance(texture(uTexture, uv + vec2(0, px.y)).rgb);
    float lumS = luminance(texture(uTexture, uv - vec2(0, px.y)).rgb);
    float lumE = luminance(texture(uTexture, uv + vec2(px.x, 0)).rgb);
    float lumW = luminance(texture(uTexture, uv - vec2(px.x, 0)).rgb);

    float lumMax = max(lumC, max(max(lumN, lumS), max(lumE, lumW)));
    float lumMin = min(lumC, min(min(lumN, lumS), min(lumE, lumW)));
    float lumRange = lumMax - lumMin;

    if (lumRange < max(0.0312, lumMax * 0.125)) {
        fragColor = texture(uTexture, uv);
        return;
    }

    float lumNW = luminance(texture(uTexture, uv + vec2(-px.x, px.y)).rgb);
    float lumNE = luminance(texture(uTexture, uv + px).rgb);
    float lumSW = luminance(texture(uTexture, uv - px).rgb);
    float lumSE = luminance(texture(uTexture, uv + vec2(px.x, -px.y)).rgb);

    float edgeH = abs(lumN + lumS - 2.0 * lumC) * 2.0
                + abs(lumNE + lumSE - 2.0 * lumE)
                + abs(lumNW + lumSW - 2.0 * lumW);
    float edgeV = abs(lumE + lumW - 2.0 * lumC) * 2.0
                + abs(lumNE + lumNW - 2.0 * lumN)
                + abs(lumSE + lumSW - 2.0 * lumS);

    bool isHorizontal = edgeH >= edgeV;

    float stepLen = isHorizontal ? px.y : px.x;
    float gradPos = isHorizontal ? abs(lumN - lumC) : abs(lumE - lumC);
    float gradNeg = isHorizontal ? abs(lumS - lumC) : abs(lumW - lumC);

    if (gradNeg > gradPos) {
        stepLen = -stepLen;
    }

    vec2 uvEdge = uv;
    if (isHorizontal) {
        uvEdge.y += stepLen * 0.5;
    } else {
        uvEdge.x += stepLen * 0.5;
    }

    vec2 edgeDir = isHorizontal ? vec2(px.x, 0.0) : vec2(0.0, px.y);
    vec2 uvPos = uvEdge + edgeDir;
    vec2 uvNeg = uvEdge - edgeDir;

    float gradientScaled = max(gradPos, gradNeg) * 0.25;
    float lumLocalAvg = 0.5 * ((gradPos > gradNeg
        ? (isHorizontal ? lumN : lumE)
        : (isHorizontal ? lumS : lumW)) + lumC);

    bool reachedPos = false;
    bool reachedNeg = false;

    for (int i = 0; i < 12; i++) {
        if (!reachedPos) {
            float lumEnd = luminance(texture(uTexture, uvPos).rgb);
            reachedPos = abs(lumEnd - lumLocalAvg) >= gradientScaled;
            if (!reachedPos) uvPos += edgeDir;
        }
        if (!reachedNeg) {
            float lumEnd = luminance(texture(uTexture, uvNeg).rgb);
            reachedNeg = abs(lumEnd - lumLocalAvg) >= gradientScaled;
            if (!reachedNeg) uvNeg -= edgeDir;
        }
        if (reachedPos && reachedNeg) break;
    }

    float distPos = isHorizontal ? (uvPos.x - uv.x) : (uvPos.y - uv.y);
    float distNeg = isHorizontal ? (uv.x - uvNeg.x) : (uv.y - uvNeg.y);
    float distMin = min(distPos, distNeg);
    float edgeLen = distPos + distNeg;
    float pixelOffset = 0.5 - distMin / edgeLen;

    float subPixelFactor = clamp(abs(
        (lumN + lumS + lumE + lumW) * 0.25 - lumC
    ) / lumRange, 0.0, 1.0);
    float subPixelSmooth = smoothstep(0.0, 1.0, subPixelFactor);
    float subPixelOffset = subPixelSmooth * subPixelSmooth * 0.75;
    pixelOffset = max(pixelOffset, subPixelOffset);

    vec2 finalUv = uv;
    if (isHorizontal) {
        finalUv.y += pixelOffset * stepLen;
    } else {
        finalUv.x += pixelOffset * stepLen;
    }

    fragColor = texture(uTexture, finalUv);
}
`


export const FXAA_SHADER_DEF = {
    vertex: FXAA_VERTEX,
    fragment: FXAA_FRAGMENT,
    uniforms: ['uTexture', 'uInverseResolution'],
    attributes: ['aPosition', 'aTexCoord']
}
