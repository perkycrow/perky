export default class Geometry {

    constructor ({positions, normals, uvs, indices, tangents}) {
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
