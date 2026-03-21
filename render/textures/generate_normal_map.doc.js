import {doc, section, text, code} from '../../doc/runtime.js'


export default doc('generateNormalMap', {advanced: true}, () => {

    text(`
        Generates a normal map from a source image using the Sobel operator.
        Takes any canvas or image as input and returns a canvas with the
        computed normal data.
    `)


    section('Usage', () => {

        text(`
            Pass an image or canvas and receive a normal map canvas back.
            The \`strength\` option controls how pronounced the surface detail appears.
        `)

        code('Basic usage', () => {
            const normalCanvas = generateNormalMap(sourceImage)
            const strongerNormals = generateNormalMap(sourceImage, {strength: 4.0})
        })

    })


    section('How It Works', () => {

        text(`
            The function converts the input to grayscale, then applies a Sobel
            filter to detect horizontal and vertical edges. These gradients
            become the X and Y components of surface normals, encoded as RGB
            values in the standard normal map format (R=X, G=Y, B=Z).

            Higher \`strength\` values amplify the detected edges, creating
            more dramatic surface relief. The default strength is 2.0.
        `)

    })


    section('With Materials', () => {

        text(`
            Normal maps generated this way can be assigned to a
            [[Material3D@render]] and used with the mesh renderer
            to add surface detail without additional geometry.
        `)

        code('Material example', () => {
            const normalMap = generateNormalMap(diffuseTexture)
            const material = new Material3D({
                texture: diffuseTexture,
                normalMap: normalMap,
                normalStrength: 1.5
            })
        })

    })

})
