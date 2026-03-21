import {doc, section, text, code, action, logger} from '../../doc/runtime.js'
import Brush from './brush.js'
import BrushSet from './brush_set.js'
import BrushHistory from './brush_history.js'


export default doc('BrushHistory', () => {

    text(`
        Undo/redo history for a [[BrushSet@render_csg]].
        Stores snapshots of the brush set state, allowing users to
        step backward and forward through their edits.
    `)


    section('Creation', () => {

        text('Create a history tied to a brush set.')

        code('Basic usage', () => {
            const brushSet = new BrushSet()
            const history = new BrushHistory(brushSet)
        })

        code('With custom max states', () => {
            const brushSet = new BrushSet()
            const history = new BrushHistory(brushSet, {maxStates: 100})
        })

    })


    section('Saving State', () => {

        text('Call save() after each user action to capture the state.')

        action('Save states', () => {
            const brushSet = new BrushSet()
            const history = new BrushHistory(brushSet)

            brushSet.add(new Brush({shape: 'box'}))
            history.save()
            logger.log('after first save:', history.stateCount, 'states')

            brushSet.add(new Brush({shape: 'sphere', x: 1}))
            history.save()
            logger.log('after second save:', history.stateCount, 'states')
        })

    })


    section('Undo and Redo', () => {

        text('Navigate through saved states.')

        action('Undo', () => {
            const brushSet = new BrushSet()
            const history = new BrushHistory(brushSet)

            brushSet.add(new Brush({shape: 'box'}))
            history.save()
            brushSet.add(new Brush({shape: 'sphere'}))
            history.save()

            logger.log('before undo:', brushSet.count, 'brushes')
            logger.log('canUndo:', history.canUndo)

            history.undo()
            logger.log('after undo:', brushSet.count, 'brushes')
        })

        action('Redo', () => {
            const brushSet = new BrushSet()
            const history = new BrushHistory(brushSet)

            brushSet.add(new Brush({shape: 'box'}))
            history.save()
            brushSet.add(new Brush({shape: 'sphere'}))
            history.save()

            history.undo()
            logger.log('after undo:', brushSet.count, 'brushes')
            logger.log('canRedo:', history.canRedo)

            history.redo()
            logger.log('after redo:', brushSet.count, 'brushes')
        })

        action('canUndo and canRedo', () => {
            const brushSet = new BrushSet()
            const history = new BrushHistory(brushSet)

            logger.log('initial canUndo:', history.canUndo)
            logger.log('initial canRedo:', history.canRedo)

            brushSet.add(new Brush({shape: 'box'}))
            history.save()
            brushSet.add(new Brush({shape: 'sphere'}))
            history.save()

            logger.log('after saves canUndo:', history.canUndo)
            logger.log('after saves canRedo:', history.canRedo)

            history.undo()
            logger.log('after undo canUndo:', history.canUndo)
            logger.log('after undo canRedo:', history.canRedo)
        })

    })


    section('Clear', () => {

        text('Reset history when starting fresh.')

        action('Clear history', () => {
            const brushSet = new BrushSet()
            const history = new BrushHistory(brushSet)

            brushSet.add(new Brush({shape: 'box'}))
            history.save()
            brushSet.add(new Brush({shape: 'sphere'}))
            history.save()

            logger.log('before clear:', history.stateCount, 'states')
            history.clear()
            logger.log('after clear:', history.stateCount, 'states')
            logger.log('canUndo:', history.canUndo)
        })

    })


    section('Max States', () => {

        text('Older states are automatically removed when the limit is reached.')

        action('State limit', () => {
            const brushSet = new BrushSet()
            const history = new BrushHistory(brushSet, {maxStates: 3})

            for (let i = 0; i < 5; i++) {
                brushSet.add(new Brush({shape: 'box', x: i}))
                history.save()
                logger.log('save', i + 1, '- states:', history.stateCount)
            }
        })

    })

})
