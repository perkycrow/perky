import {doc, section, text, code} from '../../doc/runtime.js'


export default doc('ConflictResolver', {advanced: true}, () => {

    text(`
        A dialog component for resolving version conflicts between game
        animators and locally modified ones. Presents a side-by-side card
        picker for each conflict and returns the user's choices as a promise.
        Used by [[HubView@studio]] when both the game and local versions
        have changed independently.
    `)


    section('resolve', () => {

        text(`
            Opens the overlay with a list of conflicts. Each conflict shows
            two version cards — "My version" (local) and "Native version"
            (game). The user picks one per conflict and clicks Continue.
            Returns a promise that resolves with an array of
            \`{id, choice}\` objects.
        `)

        code('Usage', async () => {
            const resolver = document.createElement('conflict-resolver')
            document.body.appendChild(resolver)

            const choices = await resolver.resolve([
                {id: 'playerAnimator', name: 'playerAnimator', customDate: 1700000000, gameDate: 1700100000}
            ])

            choices[0].choice // 'custom' or 'game'
        })

    })

})
