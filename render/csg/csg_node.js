import CSGPlane from './csg_plane.js'


export default class CSGNode {

    constructor (polygons, epsilon) {
        this.plane = null
        this.front = null
        this.back = null
        this.polygons = []

        if (polygons && polygons.length) {
            this.build(polygons, epsilon)
        }
    }


    clone () {
        const node = new CSGNode()
        if (this.plane) {
            node.plane = this.plane.clone()
        }
        if (this.front) {
            node.front = this.front.clone()
        }
        if (this.back) {
            node.back = this.back.clone()
        }
        node.polygons = this.polygons.map(p => p.clone())
        return node
    }


    invert () {
        for (const polygon of this.polygons) {
            polygon.flip()
        }
        if (this.plane) {
            this.plane.flip()
        }
        if (this.front) {
            this.front.invert()
        }
        if (this.back) {
            this.back.invert()
        }
        const temp = this.front
        this.front = this.back
        this.back = temp
    }


    clipPolygons (polygons, epsilon) {
        if (!this.plane) {
            return [...polygons]
        }

        let front = []
        let back = []

        for (const polygon of polygons) {
            this.plane.splitPolygon(polygon, front, back, front, back, epsilon)
        }

        front = this.front ? this.front.clipPolygons(front, epsilon) : front
        back = this.back ? this.back.clipPolygons(back, epsilon) : []

        return front.concat(back)
    }


    clipTo (bsp, epsilon) {
        this.polygons = bsp.clipPolygons(this.polygons, epsilon)
        if (this.front) {
            this.front.clipTo(bsp, epsilon)
        }
        if (this.back) {
            this.back.clipTo(bsp, epsilon)
        }
    }


    allPolygons () {
        let polygons = [...this.polygons]
        if (this.front) {
            polygons = polygons.concat(this.front.allPolygons())
        }
        if (this.back) {
            polygons = polygons.concat(this.back.allPolygons())
        }
        return polygons
    }


    build (polygons, epsilon) {
        if (!polygons.length) {
            return
        }

        if (!this.plane) {
            this.plane = new CSGPlane(
                polygons[0].plane.normal.clone(),
                polygons[0].plane.w
            )
        }

        const front = []
        const back = []

        for (const polygon of polygons) {
            this.plane.splitPolygon(polygon, this.polygons, this.polygons, front, back, epsilon)
        }

        if (front.length) {
            if (!this.front) {
                this.front = new CSGNode()
            }
            this.front.build(front, epsilon)
        }

        if (back.length) {
            if (!this.back) {
                this.back = new CSGNode()
            }
            this.back.build(back, epsilon)
        }
    }

}
