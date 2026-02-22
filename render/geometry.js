export default class Geometry {

    constructor ({positions, normals, uvs, indices}) {
        this.positions = positions instanceof Float32Array ? positions : new Float32Array(positions)
        this.normals = normals instanceof Float32Array ? normals : new Float32Array(normals)
        this.uvs = uvs instanceof Float32Array ? uvs : new Float32Array(uvs)
        this.indices = indices instanceof Uint16Array ? indices : new Uint16Array(indices)
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
        })
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
        })
    }

}
