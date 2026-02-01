import {doc, section, text} from '../../doc/runtime.js'


export default doc('StorageInfo', {advanced: true}, () => {

    text(`
        A small popover widget that displays IndexedDB storage usage.
        Shown in the [[HubView@studio]] header as a clickable "Perky Studio"
        button. Clicking it opens a popover with the current storage
        consumption and a visual usage bar.
    `)


    section('Popover behavior', () => {

        text(`
            Clicking the button fetches a fresh storage estimate via
            \`navigator.storage.estimate()\` and displays used/total bytes
            with a fill bar. Clicking outside the popover closes it.
        `)

    })

})
