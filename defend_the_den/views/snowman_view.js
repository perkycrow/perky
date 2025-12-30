import EntityView from '../../game/entity_view'
import Group2D from '../../render/group_2d'
import Circle from '../../render/circle'


export default class SnowmanView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        this.root = new Group2D({name: 'snowman'})

        const body = new Circle({
            x: 0,
            y: 0,
            radius: 0.35,
            color: '#f0f0f0'
        })

        const head = new Circle({
            x: 0,
            y: 0.45,
            radius: 0.22,
            color: '#ffffff'
        })

        const leftEye = new Circle({
            x: -0.08,
            y: 0.52,
            radius: 0.04,
            color: '#222222'
        })

        const rightEye = new Circle({
            x: 0.08,
            y: 0.52,
            radius: 0.04,
            color: '#222222'
        })

        const nose = new Circle({
            x: 0,
            y: 0.42,
            radius: 0.05,
            color: '#ff6b35'
        })

        const button1 = new Circle({
            x: 0,
            y: 0.1,
            radius: 0.04,
            color: '#333333'
        })

        const button2 = new Circle({
            x: 0,
            y: -0.05,
            radius: 0.04,
            color: '#333333'
        })

        const button3 = new Circle({
            x: 0,
            y: -0.2,
            radius: 0.04,
            color: '#333333'
        })

        this.root.addChild(body)
        this.root.addChild(head)
        this.root.addChild(leftEye)
        this.root.addChild(rightEye)
        this.root.addChild(nose)
        this.root.addChild(button1)
        this.root.addChild(button2)
        this.root.addChild(button3)
    }

}

