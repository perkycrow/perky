export default class Geometry {

    constructor ({positions, normals, uvs, indices, tangents} = {}) {
        this.positions = positions instanceof Float32Array ? positions : new Float32Array(positions)
        this.normals = normals instanceof Float32Array ? normals : new Float32Array(normals)
        this.uvs = uvs instanceof Float32Array ? uvs : new Float32Array(uvs)
        this.indices = indices instanceof Uint16Array ? indices : new Uint16Array(indices)
        if (tangents) {
            this.tangents = tangents instanceof Float32Array ? tangents : new Float32Array(tangents)
        } else {
            this.tangents = null
        }
    }


    computeTangents () {
        this.tangents = calculateTangents(this.positions, this.normals, this.uvs, this.indices)
        return this
    }


    get vertexCount () {
        return this.positions.length / 3
    }


    get indexCount () {
        return this.indices.length
    }


    static createBox (width = 1, height = 1, depth = 1) {
        const hw = width / 2
        const hh = height / 2
        const hd = depth / 2

        const positions = []
        const normals = []
        const uvs = []
        const indices = []

        let vertexOffset = 0

        function addFace (corners, normal) {
            for (const [px, py, pz] of corners) {
                positions.push(px, py, pz)
                normals.push(normal[0], normal[1], normal[2])
            }
            uvs.push(0, 0, 1, 0, 1, 1, 0, 1)
            indices.push(
                vertexOffset, vertexOffset + 1, vertexOffset + 2,
                vertexOffset, vertexOffset + 2, vertexOffset + 3
            )
            vertexOffset += 4
        }

        addFace(
            [[hw, hh, hd], [-hw, hh, hd], [-hw, -hh, hd], [hw, -hh, hd]],
            [0, 0, 1]
        )

        addFace(
            [[-hw, hh, -hd], [hw, hh, -hd], [hw, -hh, -hd], [-hw, -hh, -hd]],
            [0, 0, -1]
        )

        addFace(
            [[-hw, hh, hd], [hw, hh, hd], [hw, hh, -hd], [-hw, hh, -hd]],
            [0, 1, 0]
        )

        addFace(
            [[-hw, -hh, -hd], [hw, -hh, -hd], [hw, -hh, hd], [-hw, -hh, hd]],
            [0, -1, 0]
        )

        addFace(
            [[hw, hh, hd], [hw, hh, -hd], [hw, -hh, -hd], [hw, -hh, hd]],
            [1, 0, 0]
        )

        addFace(
            [[-hw, hh, -hd], [-hw, hh, hd], [-hw, -hh, hd], [-hw, -hh, -hd]],
            [-1, 0, 0]
        )

        return new Geometry({
            positions,
            normals,
            uvs,
            indices
        }).computeTangents()
    }


    static createPlane (width = 1, height = 1, segmentsW = 1, segmentsH = 1) {
        const positions = []
        const normals = []
        const uvs = []
        const indices = []

        const hw = width / 2
        const hh = height / 2

        for (let iy = 0; iy <= segmentsH; iy++) {
            const v = iy / segmentsH
            const y = v * height - hh

            for (let ix = 0; ix <= segmentsW; ix++) {
                const u = ix / segmentsW
                const x = u * width - hw

                positions.push(x, 0, y)
                normals.push(0, 1, 0)
                uvs.push(u, v)
            }
        }

        for (let iy = 0; iy < segmentsH; iy++) {
            for (let ix = 0; ix < segmentsW; ix++) {
                const a = ix + (segmentsW + 1) * iy
                const b = ix + (segmentsW + 1) * (iy + 1)
                const c = (ix + 1) + (segmentsW + 1) * (iy + 1)
                const d = (ix + 1) + (segmentsW + 1) * iy

                indices.push(a, b, c)
                indices.push(a, c, d)
            }
        }

        return new Geometry({
            positions,
            normals,
            uvs,
            indices
        }).computeTangents()
    }


    static createSphere (radius = 0.5, widthSegments = 16, heightSegments = 12) {
        const positions = []
        const normals = []
        const uvs = []
        const indices = []

        for (let iy = 0; iy <= heightSegments; iy++) {
            const v = iy / heightSegments
            const phi = v * Math.PI
            const sinPhi = Math.sin(phi)
            const cosPhi = Math.cos(phi)

            for (let ix = 0; ix <= widthSegments; ix++) {
                const u = ix / widthSegments
                const theta = u * 2 * Math.PI
                const sinTheta = Math.sin(theta)
                const cosTheta = Math.cos(theta)

                const nx = cosTheta * sinPhi
                const ny = cosPhi
                const nz = sinTheta * sinPhi

                positions.push(nx * radius, ny * radius, nz * radius)
                normals.push(nx, ny, nz)
                uvs.push(u, v)
            }
        }

        for (let iy = 0; iy < heightSegments; iy++) {
            for (let ix = 0; ix < widthSegments; ix++) {
                const a = ix + (widthSegments + 1) * iy
                const b = ix + (widthSegments + 1) * (iy + 1)
                const c = (ix + 1) + (widthSegments + 1) * (iy + 1)
                const d = (ix + 1) + (widthSegments + 1) * iy

                indices.push(a, b, c)
                indices.push(a, c, d)
            }
        }

        return new Geometry({
            positions,
            normals,
            uvs,
            indices
        }).computeTangents()
    }


    static createCylinder (options = {}) {
        return buildCylinder(options)
    }

}


function buildCylinder (options) {
    const radiusTop = options.radiusTop ?? 0.5
    const radiusBottom = options.radiusBottom ?? 0.5
    const height = options.height ?? 1
    const radialSegments = options.radialSegments ?? 16
    const openEnded = options.openEnded ?? false

    const positions = []
    const normals = []
    const uvs = []
    const indices = []

    const halfHeight = height / 2
    const slope = (radiusBottom - radiusTop) / height

    for (let iy = 0; iy <= 1; iy++) {
        const y = iy === 0 ? -halfHeight : halfHeight
        const radius = iy === 0 ? radiusBottom : radiusTop

        for (let ix = 0; ix <= radialSegments; ix++) {
            const u = ix / radialSegments
            const theta = u * 2 * Math.PI
            const cosT = Math.cos(theta)
            const sinT = Math.sin(theta)

            positions.push(cosT * radius, y, sinT * radius)

            const ny = slope
            const len = Math.sqrt(1 + ny * ny)
            normals.push(cosT / len, ny / len, sinT / len)

            uvs.push(u, iy)
        }
    }

    const stride = radialSegments + 1

    for (let ix = 0; ix < radialSegments; ix++) {
        const a = ix
        const b = ix + stride
        const c = ix + 1 + stride
        const d = ix + 1

        indices.push(a, b, c)
        indices.push(a, c, d)
    }

    if (!openEnded) {
        if (radiusBottom > 0) {
            buildCap(positions, normals, uvs, indices, radiusBottom, -halfHeight, -1, radialSegments)
        }
        if (radiusTop > 0) {
            buildCap(positions, normals, uvs, indices, radiusTop, halfHeight, 1, radialSegments)
        }
    }

    return new Geometry({
        positions,
        normals,
        uvs,
        indices
    }).computeTangents()
}


function buildCap (positions, normals, uvs, indices, radius, y, sign, segments) { // eslint-disable-line max-params -- clean
    const centerIndex = positions.length / 3

    positions.push(0, y, 0)
    normals.push(0, sign, 0)
    uvs.push(0.5, 0.5)

    for (let ix = 0; ix <= segments; ix++) {
        const theta = (ix / segments) * 2 * Math.PI
        const cosT = Math.cos(theta)
        const sinT = Math.sin(theta)

        positions.push(cosT * radius, y, sinT * radius)
        normals.push(0, sign, 0)
        uvs.push(cosT * 0.5 + 0.5, sinT * 0.5 + 0.5)
    }

    for (let ix = 0; ix < segments; ix++) {
        const current = centerIndex + 1 + ix
        const next = centerIndex + 1 + ix + 1

        if (sign > 0) {
            indices.push(centerIndex, current, next)
        } else {
            indices.push(centerIndex, next, current)
        }
    }
}


function calculateTangents (positions, normals, uvs, indices) {
    const vertexCount = positions.length / 3
    const tangents = new Float32Array(vertexCount * 3)

    for (let i = 0; i < indices.length; i += 3) {
        const i0 = indices[i]
        const i1 = indices[i + 1]
        const i2 = indices[i + 2]

        const p0x = positions[i0 * 3]
        const p0y = positions[i0 * 3 + 1]
        const p0z = positions[i0 * 3 + 2]
        const p1x = positions[i1 * 3]
        const p1y = positions[i1 * 3 + 1]
        const p1z = positions[i1 * 3 + 2]
        const p2x = positions[i2 * 3]
        const p2y = positions[i2 * 3 + 1]
        const p2z = positions[i2 * 3 + 2]

        const e1x = p1x - p0x
        const e1y = p1y - p0y
        const e1z = p1z - p0z
        const e2x = p2x - p0x
        const e2y = p2y - p0y
        const e2z = p2z - p0z

        const du1 = uvs[i1 * 2] - uvs[i0 * 2]
        const dv1 = uvs[i1 * 2 + 1] - uvs[i0 * 2 + 1]
        const du2 = uvs[i2 * 2] - uvs[i0 * 2]
        const dv2 = uvs[i2 * 2 + 1] - uvs[i0 * 2 + 1]

        let det = du1 * dv2 - du2 * dv1
        if (Math.abs(det) < 1e-8) {
            det = 1e-8
        }
        const r = 1.0 / det

        const tx = (e1x * dv2 - e2x * dv1) * r
        const ty = (e1y * dv2 - e2y * dv1) * r
        const tz = (e1z * dv2 - e2z * dv1) * r

        tangents[i0 * 3] += tx
        tangents[i0 * 3 + 1] += ty
        tangents[i0 * 3 + 2] += tz
        tangents[i1 * 3] += tx
        tangents[i1 * 3 + 1] += ty
        tangents[i1 * 3 + 2] += tz
        tangents[i2 * 3] += tx
        tangents[i2 * 3 + 1] += ty
        tangents[i2 * 3 + 2] += tz
    }

    for (let i = 0; i < vertexCount; i++) {
        const nx = normals[i * 3]
        const ny = normals[i * 3 + 1]
        const nz = normals[i * 3 + 2]
        let tx = tangents[i * 3]
        let ty = tangents[i * 3 + 1]
        let tz = tangents[i * 3 + 2]

        const dot = tx * nx + ty * ny + tz * nz
        tx -= nx * dot
        ty -= ny * dot
        tz -= nz * dot

        const len = Math.sqrt(tx * tx + ty * ty + tz * tz)
        if (len > 1e-8) {
            tangents[i * 3] = tx / len
            tangents[i * 3 + 1] = ty / len
            tangents[i * 3 + 2] = tz / len
        }
    }

    return tangents
}
