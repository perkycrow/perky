import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import Brush from './brush.js'
import BrushSet from './brush_set.js'


export default doc('BrushSet', () => {

    text(`
        A collection of [[Brush@render_csg]] objects that can be combined
        using CSG operations. Manages incremental rebuilds by caching
        intermediate results at each brush.
    `)


    section('Creation', () => {

        text('Create an empty brush set and add brushes.')

        code('Basic usage', () => {
            const brushSet = new BrushSet()
            brushSet.add(new Brush({shape: 'box'}))
            brushSet.add(new Brush({shape: 'sphere', operation: 'subtract', x: 0.5}))
            brushSet.build()
        })

    })


    section('Managing Brushes', () => {

        text('Add, remove, and reorder brushes in the set.')

        action('add', () => {
            const brushSet = new BrushSet()
            brushSet.add(new Brush({shape: 'box'}))
            brushSet.add(new Brush({shape: 'sphere'}))
            logger.log('count:', brushSet.count)
        })

        action('add at index', () => {
            const brushSet = new BrushSet()
            brushSet.add(new Brush({shape: 'box'}))
            brushSet.add(new Brush({shape: 'cone'}))
            brushSet.add(new Brush({shape: 'sphere'}), 1)
            logger.log('count:', brushSet.count)
            logger.log('at index 1:', brushSet.get(1).shape)
        })

        action('remove', () => {
            const brushSet = new BrushSet()
            brushSet.add(new Brush({shape: 'box'}))
            brushSet.add(new Brush({shape: 'sphere'}))
            logger.log('before:', brushSet.count)

            const removed = brushSet.remove(0)
            logger.log('removed:', removed.shape)
            logger.log('after:', brushSet.count)
        })

        action('get', () => {
            const brushSet = new BrushSet()
            brushSet.add(new Brush({shape: 'box'}))
            brushSet.add(new Brush({shape: 'sphere'}))

            logger.log('at 0:', brushSet.get(0).shape)
            logger.log('at 1:', brushSet.get(1).shape)
            logger.log('at 99:', brushSet.get(99))
        })

        action('move', () => {
            const brushSet = new BrushSet()
            brushSet.add(new Brush({shape: 'box'}))
            brushSet.add(new Brush({shape: 'sphere'}))
            brushSet.add(new Brush({shape: 'cylinder'}))

            logger.log('before:', brushSet.brushes.map(b => b.shape).join(', '))
            brushSet.move(2, 0)
            logger.log('after:', brushSet.brushes.map(b => b.shape).join(', '))
        })

        action('replace', () => {
            const brushSet = new BrushSet()
            brushSet.add(new Brush({shape: 'box'}))

            const old = brushSet.replace(0, new Brush({shape: 'sphere'}))
            logger.log('replaced:', old.shape)
            logger.log('new:', brushSet.get(0).shape)
        })

    })


    section('Building', () => {

        text('Build combines all brushes using their CSG operations.')

        action('build', () => {
            const brushSet = new BrushSet()
            brushSet.add(new Brush({shape: 'box'}))
            brushSet.add(new Brush({shape: 'sphere', operation: 'subtract', x: 0.5}))

            const geometry = brushSet.build()
            logger.log('vertices:', geometry.vertexCount)
            logger.log('indices:', geometry.indexCount)
        })

        action('result property', () => {
            const brushSet = new BrushSet()
            brushSet.add(new Brush({shape: 'box'}))

            logger.log('before build:', brushSet.result)
            brushSet.build()
            logger.log('after build:', brushSet.result !== null)
        })

        action('change event', () => {
            const brushSet = new BrushSet()
            brushSet.on('change', ({geometry, brushCount}) => {
                logger.log('change event - brushes:', brushCount, 'vertices:', geometry.vertexCount)
            })

            brushSet.add(new Brush({shape: 'box'}))
            brushSet.build()
        })

    })


    section('Incremental Rebuild', () => {

        text(`
            The brush set caches intermediate CSG results at each brush.
            Modifications only rebuild from the changed brush forward.
        `)

        action('rebuild', () => {
            const brushSet = new BrushSet()
            brushSet.add(new Brush({shape: 'box'}))
            brushSet.add(new Brush({shape: 'sphere', operation: 'subtract', x: 0.5}))
            brushSet.add(new Brush({shape: 'cylinder', operation: 'subtract', y: 0.5}))
            brushSet.build()

            brushSet.get(2).position.y = -0.5
            const geometry = brushSet.rebuild(2)
            logger.log('rebuilt from index 2')
            logger.log('vertices:', geometry.vertexCount)
        })

    })


    section('Serialization', () => {

        text('Convert brush sets to/from JSON.')

        action('toJSON', () => {
            const brushSet = new BrushSet()
            brushSet.add(new Brush({shape: 'box'}))
            brushSet.add(new Brush({shape: 'sphere', x: 1}))

            const json = brushSet.toJSON()
            logger.log('entries:', json.length)
            logger.log('first shape:', json[0].shape)
            logger.log('second shape:', json[1].shape)
        })

        action('fromJSON', () => {
            const data = [
                {shape: 'box', operation: 'union'},
                {shape: 'sphere', operation: 'subtract', x: 0.5}
            ]
            const brushSet = BrushSet.fromJSON(data)
            logger.log('count:', brushSet.count)
            logger.log('shapes:', brushSet.brushes.map(b => b.shape).join(', '))
        })

    })

})
