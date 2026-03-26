import {doc, text, code} from '../doc/runtime.js'
import {pickFile} from './file_utils.js'


export default doc('File Utils', () => {

    text(`
        Browser file picker helper.
        Opens the native file dialog and returns the selected file.
    `)


    code('Pick an image file', async () => {
        const file = await pickFile('image/*')
        if (file) {
            // file is a File object
            const url = URL.createObjectURL(file)
        }
    })


    code('Pick a JSON file', async () => {
        const file = await pickFile('.json')
        if (file) {
            const content = await file.text()
            const data = JSON.parse(content)
        }
    })

})
