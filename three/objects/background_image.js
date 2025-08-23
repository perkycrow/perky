import Sprite from './sprite'


export default class BackgroundImage extends Sprite {

    resize (containerSize, camera) {
        if (!this.image || !camera.isOrthographicCamera) {
            return
        }

        const containerAspect = containerSize.width / containerSize.height

        const viewHeight = camera.top - camera.bottom
        const viewWidth = viewHeight * containerAspect

        const image = this.image
        const imageAspect = image.width / image.height

        let scaleX
        let scaleY
        if (containerAspect > imageAspect) {
            scaleX = viewWidth / image.width
            scaleY = scaleX
        } else {
            scaleY = viewHeight / image.height
            scaleX = scaleY
        }

        this.scale.set(
            scaleX * image.width,
            scaleY * image.height,
            1
        )
    }

}
