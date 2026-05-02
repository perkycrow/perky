const SMAA_DEFINES = `
#define SMAA_THRESHOLD 0.1
#define SMAA_MAX_SEARCH_STEPS 16
#define SMAA_MAX_SEARCH_STEPS_DIAG 8
#define SMAA_CORNER_ROUNDING 25
#define SMAA_AREATEX_MAX_DISTANCE 16
#define SMAA_AREATEX_MAX_DISTANCE_DIAG 20
#define SMAA_AREATEX_PIXEL_SIZE (1.0 / vec2(160.0, 560.0))
#define SMAA_AREATEX_SUBTEX_SIZE (1.0 / 7.0)
#define SMAA_SEARCHTEX_SIZE vec2(66.0, 33.0)
#define SMAA_SEARCHTEX_PACKED_SIZE vec2(64.0, 16.0)
#define SMAA_CORNER_ROUNDING_NORM (float(SMAA_CORNER_ROUNDING) / 100.0)
#define mad(a, b, c) ((a) * (b) + (c))
#define saturate(a) clamp(a, 0.0, 1.0)
`


export const SMAA_EDGE_VERTEX = `#version 300 es
${SMAA_DEFINES}
in vec2 aPosition;
uniform vec2 uTexelSize;
out vec2 vTexCoord;
out vec4 vOffset0;
out vec4 vOffset1;
out vec4 vOffset2;
void main() {
    vTexCoord = (aPosition + 1.0) * 0.5;
    vOffset0 = mad(vec4(uTexelSize, uTexelSize), vec4(-1.0, 0.0, 0.0, -1.0), vTexCoord.xyxy);
    vOffset1 = mad(vec4(uTexelSize, uTexelSize), vec4( 1.0, 0.0, 0.0,  1.0), vTexCoord.xyxy);
    vOffset2 = mad(vec4(uTexelSize, uTexelSize), vec4(-2.0, 0.0, 0.0, -2.0), vTexCoord.xyxy);
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`


export const SMAA_EDGE_FRAGMENT = `#version 300 es
precision highp float;
${SMAA_DEFINES}
#define SMAA_LOCAL_CONTRAST_ADAPTATION_FACTOR 2.0
uniform sampler2D uColorTexture;
in vec2 vTexCoord;
in vec4 vOffset0;
in vec4 vOffset1;
in vec4 vOffset2;
out vec4 fragColor;
void main() {
    vec2 threshold = vec2(SMAA_THRESHOLD);
    vec3 weights = vec3(0.2126, 0.7152, 0.0722);
    float L = dot(texture(uColorTexture, vTexCoord).rgb, weights);
    float Lleft = dot(texture(uColorTexture, vOffset0.xy).rgb, weights);
    float Ltop = dot(texture(uColorTexture, vOffset0.zw).rgb, weights);
    vec4 delta;
    delta.xy = abs(L - vec2(Lleft, Ltop));
    vec2 edges = step(threshold, delta.xy);
    if (dot(edges, vec2(1.0)) == 0.0) discard;
    float Lright = dot(texture(uColorTexture, vOffset1.xy).rgb, weights);
    float Lbottom = dot(texture(uColorTexture, vOffset1.zw).rgb, weights);
    delta.zw = abs(L - vec2(Lright, Lbottom));
    vec2 maxDelta = max(delta.xy, delta.zw);
    float Lleftleft = dot(texture(uColorTexture, vOffset2.xy).rgb, weights);
    float Ltoptop = dot(texture(uColorTexture, vOffset2.zw).rgb, weights);
    delta.zw = abs(vec2(Lleft, Ltop) - vec2(Lleftleft, Ltoptop));
    maxDelta = max(maxDelta, delta.zw);
    float finalDelta = max(maxDelta.x, maxDelta.y);
    edges *= step(finalDelta, SMAA_LOCAL_CONTRAST_ADAPTATION_FACTOR * delta.xy);
    fragColor = vec4(edges, 0.0, 1.0);
}
`


export const SMAA_WEIGHT_VERTEX = `#version 300 es
${SMAA_DEFINES}
in vec2 aPosition;
uniform vec2 uViewportSize;
uniform vec2 uTexelSize;
out vec2 vTexCoord;
out vec2 vPixCoord;
out vec4 vOffset0;
out vec4 vOffset1;
out vec4 vOffset2;
void main() {
    vTexCoord = (aPosition + 1.0) * 0.5;
    vPixCoord = vTexCoord * uViewportSize;
    vOffset0 = mad(vec4(uTexelSize, uTexelSize), vec4(-0.25, -0.125, 1.25, -0.125), vTexCoord.xyxy);
    vOffset1 = mad(vec4(uTexelSize, uTexelSize), vec4(-0.125, -0.25, -0.125, 1.25), vTexCoord.xyxy);
    vOffset2 = mad(
        vec4(uTexelSize.x, uTexelSize.x, uTexelSize.y, uTexelSize.y),
        vec4(-2.0, 2.0, -2.0, 2.0) * float(SMAA_MAX_SEARCH_STEPS),
        vec4(vOffset0.xz, vOffset1.yw)
    );
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`


export const SMAA_WEIGHT_FRAGMENT = `#version 300 es
precision highp float;
precision highp int;
${SMAA_DEFINES}
#define SMAASampleLevelZeroOffset(tex, coord, off) texture(tex, coord + vec2(off) * uTexelSize)
uniform vec2 uViewportSize;
uniform vec2 uTexelSize;
uniform sampler2D uEdgesTexture;
uniform sampler2D uAreaTexture;
uniform sampler2D uSearchTexture;
in vec2 vTexCoord;
in vec2 vPixCoord;
in vec4 vOffset0;
in vec4 vOffset1;
in vec4 vOffset2;
out vec4 fragColor;

void SMAAMovc(bvec2 cond, inout vec2 variable, vec2 value) {
    if (cond.x) variable.x = value.x;
    if (cond.y) variable.y = value.y;
}

vec2 SMAADecodeDiagBilinearAccess(vec2 e) {
    e.r = e.r * abs(5.0 * e.r - 5.0 * 0.75);
    return round(e);
}

vec4 SMAADecodeDiagBilinearAccess4(vec4 e) {
    e.rb = e.rb * abs(5.0 * e.rb - 5.0 * 0.75);
    return round(e);
}

vec2 SMAASearchDiag1(vec2 texcoord, vec2 dir, out vec2 e) {
    vec4 coord = vec4(texcoord, -1.0, 1.0);
    vec3 t = vec3(uTexelSize, 1.0);
    for (int i = 0; i < SMAA_MAX_SEARCH_STEPS_DIAG; i++) {
        if (!(coord.z < float(SMAA_MAX_SEARCH_STEPS_DIAG - 1) && coord.w > 0.9)) break;
        coord.xyz = mad(t, vec3(dir, 1.0), coord.xyz);
        e = texture(uEdgesTexture, coord.xy).rg;
        coord.w = dot(e, vec2(0.5));
    }
    return coord.zw;
}

vec2 SMAASearchDiag2(vec2 texcoord, vec2 dir, out vec2 e) {
    vec4 coord = vec4(texcoord, -1.0, 1.0);
    coord.x += 0.25 * uTexelSize.x;
    vec3 t = vec3(uTexelSize, 1.0);
    for (int i = 0; i < SMAA_MAX_SEARCH_STEPS_DIAG; i++) {
        if (!(coord.z < float(SMAA_MAX_SEARCH_STEPS_DIAG - 1) && coord.w > 0.9)) break;
        coord.xyz = mad(t, vec3(dir, 1.0), coord.xyz);
        e = texture(uEdgesTexture, coord.xy).rg;
        e = SMAADecodeDiagBilinearAccess(e);
        coord.w = dot(e, vec2(0.5));
    }
    return coord.zw;
}

vec2 SMAAAreaDiag(vec2 dist, vec2 e, float offset) {
    vec2 texcoord = mad(vec2(SMAA_AREATEX_MAX_DISTANCE_DIAG), e, dist);
    texcoord = mad(SMAA_AREATEX_PIXEL_SIZE, texcoord, 0.5 * SMAA_AREATEX_PIXEL_SIZE);
    texcoord.x += 0.5;
    texcoord.y += SMAA_AREATEX_SUBTEX_SIZE * offset;
    return texture(uAreaTexture, texcoord).rg;
}

vec2 SMAACalculateDiagWeights(vec2 texcoord, vec2 e, vec4 subsampleIndices) {
    vec2 weights = vec2(0.0);
    vec4 d;
    vec2 end;
    if (e.r > 0.0) {
        d.xz = SMAASearchDiag1(texcoord, vec2(-1.0, 1.0), end);
        d.x += float(end.y > 0.9);
    } else {
        d.xz = vec2(0.0);
    }
    d.yw = SMAASearchDiag1(texcoord, vec2(1.0, -1.0), end);
    if (d.x + d.y > 2.0) {
        vec4 coords = mad(vec4(-d.x + 0.25, d.x, d.y, -d.y - 0.25), vec4(uTexelSize, uTexelSize), texcoord.xyxy);
        vec4 c;
        c.xy = SMAASampleLevelZeroOffset(uEdgesTexture, coords.xy, vec2(-1, 0)).rg;
        c.zw = SMAASampleLevelZeroOffset(uEdgesTexture, coords.zw, vec2(1, 0)).rg;
        c.yxwz = SMAADecodeDiagBilinearAccess4(c.xyzw);
        vec2 cc = mad(vec2(2.0), c.xz, c.yw);
        SMAAMovc(bvec2(step(0.9, d.zw)), cc, vec2(0.0));
        weights += SMAAAreaDiag(d.xy, cc, subsampleIndices.z);
    }
    d.xz = SMAASearchDiag2(texcoord, vec2(-1.0, -1.0), end);
    if (SMAASampleLevelZeroOffset(uEdgesTexture, texcoord, vec2(1, 0)).r > 0.0) {
        d.yw = SMAASearchDiag2(texcoord, vec2(1.0, 1.0), end);
        d.y += float(end.y > 0.9);
    } else {
        d.yw = vec2(0.0);
    }
    if (d.x + d.y > 2.0) {
        vec4 coords = mad(vec4(-d.x, -d.x, d.y, d.y), vec4(uTexelSize, uTexelSize), texcoord.xyxy);
        vec4 c;
        c.x = SMAASampleLevelZeroOffset(uEdgesTexture, coords.xy, vec2(-1, 0)).g;
        c.y = SMAASampleLevelZeroOffset(uEdgesTexture, coords.xy, vec2(0, -1)).r;
        c.zw = SMAASampleLevelZeroOffset(uEdgesTexture, coords.zw, vec2(1, 0)).gr;
        vec2 cc = mad(vec2(2.0), c.xz, c.yw);
        SMAAMovc(bvec2(step(0.9, d.zw)), cc, vec2(0.0));
        weights += SMAAAreaDiag(d.xy, cc, subsampleIndices.w).gr;
    }
    return weights;
}

float SMAASearchLength(vec2 e, float offset) {
    vec2 scale = SMAA_SEARCHTEX_SIZE * vec2(0.5, -1.0);
    vec2 bias = SMAA_SEARCHTEX_SIZE * vec2(offset, 1.0);
    scale += vec2(-1.0, 1.0);
    bias += vec2(0.5, -0.5);
    scale *= 1.0 / SMAA_SEARCHTEX_PACKED_SIZE;
    bias *= 1.0 / SMAA_SEARCHTEX_PACKED_SIZE;
    return texture(uSearchTexture, mad(scale, e, bias)).r;
}

float SMAASearchXLeft(vec2 texcoord, float end) {
    vec2 e = vec2(0.0, 1.0);
    for (int i = 0; i < SMAA_MAX_SEARCH_STEPS; i++) {
        if (!(texcoord.x > end && e.g > 0.8281 && e.r == 0.0)) break;
        e = texture(uEdgesTexture, texcoord).rg;
        texcoord = mad(-vec2(2.0, 0.0), uTexelSize, texcoord);
    }
    float offset = mad(-(255.0 / 127.0), SMAASearchLength(e, 0.0), 3.25);
    return mad(uTexelSize.x, offset, texcoord.x);
}

float SMAASearchXRight(vec2 texcoord, float end) {
    vec2 e = vec2(0.0, 1.0);
    for (int i = 0; i < SMAA_MAX_SEARCH_STEPS; i++) {
        if (!(texcoord.x < end && e.g > 0.8281 && e.r == 0.0)) break;
        e = texture(uEdgesTexture, texcoord).rg;
        texcoord = mad(vec2(2.0, 0.0), uTexelSize, texcoord);
    }
    float offset = mad(-(255.0 / 127.0), SMAASearchLength(e, 0.5), 3.25);
    return mad(-uTexelSize.x, offset, texcoord.x);
}

float SMAASearchYUp(vec2 texcoord, float end) {
    vec2 e = vec2(1.0, 0.0);
    for (int i = 0; i < SMAA_MAX_SEARCH_STEPS; i++) {
        if (!(texcoord.y > end && e.r > 0.8281 && e.g == 0.0)) break;
        e = texture(uEdgesTexture, texcoord).rg;
        texcoord = mad(-vec2(0.0, 2.0), uTexelSize, texcoord);
    }
    float offset = mad(-(255.0 / 127.0), SMAASearchLength(e.gr, 0.0), 3.25);
    return mad(uTexelSize.y, offset, texcoord.y);
}

float SMAASearchYDown(vec2 texcoord, float end) {
    vec2 e = vec2(1.0, 0.0);
    for (int i = 0; i < SMAA_MAX_SEARCH_STEPS; i++) {
        if (!(texcoord.y < end && e.r > 0.8281 && e.g == 0.0)) break;
        e = texture(uEdgesTexture, texcoord).rg;
        texcoord = mad(vec2(0.0, 2.0), uTexelSize, texcoord);
    }
    float offset = mad(-(255.0 / 127.0), SMAASearchLength(e.gr, 0.5), 3.25);
    return mad(-uTexelSize.y, offset, texcoord.y);
}

vec2 SMAAArea(vec2 dist, float e1, float e2, float offset) {
    vec2 texcoord = mad(vec2(SMAA_AREATEX_MAX_DISTANCE), round(4.0 * vec2(e1, e2)), dist);
    texcoord = mad(SMAA_AREATEX_PIXEL_SIZE, texcoord, 0.5 * SMAA_AREATEX_PIXEL_SIZE);
    texcoord.y = mad(SMAA_AREATEX_SUBTEX_SIZE, offset, texcoord.y);
    return texture(uAreaTexture, texcoord).rg;
}

void SMAADetectHorizontalCornerPattern(inout vec2 weights, vec4 texcoord, vec2 d) {
    vec2 leftRight = step(d.xy, d.yx);
    vec2 rounding = (1.0 - SMAA_CORNER_ROUNDING_NORM) * leftRight;
    rounding /= leftRight.x + leftRight.y;
    vec2 factor = vec2(1.0);
    factor.x -= rounding.x * SMAASampleLevelZeroOffset(uEdgesTexture, texcoord.xy, vec2(0, 1)).r;
    factor.x -= rounding.y * SMAASampleLevelZeroOffset(uEdgesTexture, texcoord.zw, vec2(1, 1)).r;
    factor.y -= rounding.x * SMAASampleLevelZeroOffset(uEdgesTexture, texcoord.xy, vec2(0, -2)).r;
    factor.y -= rounding.y * SMAASampleLevelZeroOffset(uEdgesTexture, texcoord.zw, vec2(1, -2)).r;
    weights *= saturate(factor);
}

void SMAADetectVerticalCornerPattern(inout vec2 weights, vec4 texcoord, vec2 d) {
    vec2 leftRight = step(d.xy, d.yx);
    vec2 rounding = (1.0 - SMAA_CORNER_ROUNDING_NORM) * leftRight;
    rounding /= leftRight.x + leftRight.y;
    vec2 factor = vec2(1.0);
    factor.x -= rounding.x * SMAASampleLevelZeroOffset(uEdgesTexture, texcoord.xy, vec2(1, 0)).g;
    factor.x -= rounding.y * SMAASampleLevelZeroOffset(uEdgesTexture, texcoord.zw, vec2(1, 1)).g;
    factor.y -= rounding.x * SMAASampleLevelZeroOffset(uEdgesTexture, texcoord.xy, vec2(-2, 0)).g;
    factor.y -= rounding.y * SMAASampleLevelZeroOffset(uEdgesTexture, texcoord.zw, vec2(-2, 1)).g;
    weights *= saturate(factor);
}

void main() {
    vec4 subsampleIndices = vec4(0.0);
    vec4 weights = vec4(0.0);
    vec2 e = texture(uEdgesTexture, vTexCoord).rg;

    if (e.g > 0.0) {
        weights.rg = SMAACalculateDiagWeights(vTexCoord, e, subsampleIndices);
        if (weights.r == -weights.g) {
            vec2 d;
            vec3 coords;
            coords.x = SMAASearchXLeft(vOffset0.xy, vOffset2.x);
            coords.y = vOffset1.y;
            d.x = coords.x;
            float e1 = texture(uEdgesTexture, coords.xy).r;
            coords.z = SMAASearchXRight(vOffset0.zw, vOffset2.y);
            d.y = coords.z;
            d = abs(round(mad(uViewportSize.xx, d, -vPixCoord.xx)));
            vec2 sqrt_d = sqrt(d);
            float e2 = SMAASampleLevelZeroOffset(uEdgesTexture, coords.zy, vec2(1, 0)).r;
            weights.rg = SMAAArea(sqrt_d, e1, e2, subsampleIndices.y);
            coords.y = vTexCoord.y;
            SMAADetectHorizontalCornerPattern(weights.rg, coords.xyzy, d);
        } else {
            e.r = 0.0;
        }
    }

    if (e.r > 0.0) {
        vec2 d;
        vec3 coords;
        coords.y = SMAASearchYUp(vOffset1.xy, vOffset2.z);
        coords.x = vOffset0.x;
        d.x = coords.y;
        float e1 = texture(uEdgesTexture, coords.xy).g;
        coords.z = SMAASearchYDown(vOffset1.zw, vOffset2.w);
        d.y = coords.z;
        d = abs(round(mad(uViewportSize.yy, d, -vPixCoord.yy)));
        vec2 sqrt_d = sqrt(d);
        float e2 = SMAASampleLevelZeroOffset(uEdgesTexture, coords.xz, vec2(0, 1)).g;
        weights.ba = SMAAArea(sqrt_d, e1, e2, subsampleIndices.x);
        coords.x = vTexCoord.x;
        SMAADetectVerticalCornerPattern(weights.ba, coords.xyxz, d);
    }

    fragColor = weights;
}
`


export const SMAA_BLEND_VERTEX = `#version 300 es
in vec2 aPosition;
uniform vec2 uTexelSize;
out vec2 vTexCoord;
out vec4 vOffset;
void main() {
    vTexCoord = (aPosition + 1.0) * 0.5;
    vOffset = vTexCoord.xyxy + uTexelSize.xyxy * vec4(1.0, 0.0, 0.0, 1.0);
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`


export const SMAA_BLEND_FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D uColorTexture;
uniform sampler2D uBlendTexture;
uniform vec2 uTexelSize;
in vec2 vTexCoord;
in vec4 vOffset;
out vec4 fragColor;

void SMAAMovc(bvec2 cond, inout vec2 variable, vec2 value) {
    if (cond.x) variable.x = value.x;
    if (cond.y) variable.y = value.y;
}

void SMAAMovc(bvec4 cond, inout vec4 variable, vec4 value) {
    SMAAMovc(cond.xy, variable.xy, value.xy);
    SMAAMovc(cond.zw, variable.zw, value.zw);
}

void main() {
    vec4 a;
    a.x = texture(uBlendTexture, vOffset.xy).a;
    a.y = texture(uBlendTexture, vOffset.zw).g;
    a.wz = texture(uBlendTexture, vTexCoord).xz;

    if (dot(a, vec4(1.0)) <= 1e-5) {
        fragColor = texture(uColorTexture, vTexCoord);
    } else {
        bool h = max(a.x, a.z) > max(a.y, a.w);
        vec4 blendingOffset = vec4(0.0, a.y, 0.0, a.w);
        vec2 blendingWeight = a.yw;
        SMAAMovc(bvec4(h, h, h, h), blendingOffset, vec4(a.x, 0.0, a.z, 0.0));
        SMAAMovc(bvec2(h, h), blendingWeight, a.xz);
        blendingWeight /= dot(blendingWeight, vec2(1.0));
        vec4 blendingCoord = blendingOffset * vec4(uTexelSize, -uTexelSize) + vTexCoord.xyxy;
        fragColor = blendingWeight.x * texture(uColorTexture, blendingCoord.xy)
                  + blendingWeight.y * texture(uColorTexture, blendingCoord.zw);
    }
}
`


export const SMAA_EDGE_SHADER_DEF = {
    vertex: SMAA_EDGE_VERTEX,
    fragment: SMAA_EDGE_FRAGMENT,
    uniforms: ['uColorTexture', 'uTexelSize'],
    attributes: ['aPosition']
}

export const SMAA_WEIGHT_SHADER_DEF = {
    vertex: SMAA_WEIGHT_VERTEX,
    fragment: SMAA_WEIGHT_FRAGMENT,
    uniforms: ['uEdgesTexture', 'uAreaTexture', 'uSearchTexture', 'uViewportSize', 'uTexelSize'],
    attributes: ['aPosition']
}

export const SMAA_BLEND_SHADER_DEF = {
    vertex: SMAA_BLEND_VERTEX,
    fragment: SMAA_BLEND_FRAGMENT,
    uniforms: ['uColorTexture', 'uBlendTexture', 'uTexelSize'],
    attributes: ['aPosition']
}
