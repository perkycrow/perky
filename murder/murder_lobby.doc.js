import {doc, section, text, code} from '../doc/runtime.js'


export default doc('MurderLobby', {advanced: true}, () => {

    text(`
        HTTP client for the Murder server's lobby REST API. Handles the full
        lobby lifecycle: listing available lobbies, creating or joining one,
        toggling ready state, launching the game, and leaving.
    `)


    section('Creating a Lobby', () => {

        text(`
            Create a MurderLobby with the server's base URL, then call
            \`create()\` with game settings. The lobby token is stored
            automatically for subsequent calls.
        `)

        code('Create and launch', () => {
            const lobby = game.create(MurderLobby, {
                baseUrl: 'https://murder.example.com'
            })

            lobby.on('created', (token) => {
                // Share token with other players
            })

            lobby.on('launched', (token) => {
                // All players ready, start the game
            })

            await lobby.create({game_slug: 'mist', max_players: 4})
            await lobby.ready()
            await lobby.launch()
        })

    })


    section('Joining a Lobby', () => {

        text(`
            Use \`join()\` with a lobby token shared by the host. Then mark
            yourself ready and wait for the host to launch.
        `)

        code('Join flow', () => {
            // await lobby.join('abc123')
            // await lobby.ready()
            // lobby.on('launched', () => { ... })
        })

    })


    section('Lobby Lifecycle', () => {

        text(`
            Methods:
            - \`list()\` — List available lobbies
            - \`fetch(token)\` — Get details for a specific lobby
            - \`create(params)\` — Create a new lobby
            - \`join(token)\` — Join an existing lobby
            - \`ready()\` — Mark yourself ready
            - \`launch()\` — Start the game (host only)
            - \`leave()\` — Leave the current lobby
        `)

    })


    section('Events', () => {

        text(`
            Key events:
            - \`created\` — Lobby created successfully
            - \`joined\` — Joined a lobby
            - \`ready\` — Marked ready
            - \`launched\` — Game started
            - \`left\` — Left the lobby
            - \`error\` — Request failed
        `)

    })


    section('Properties', () => {

        text(`
            - \`token\` — Current lobby token
            - \`status\` — Lobby status (\`waiting\`, \`in_progress\`, etc.)
            - \`members\` — Array of lobby members
            - \`gameSlug\` — Game identifier
            - \`maxPlayers\` — Maximum player count
            - \`baseUrl\` — Server base URL
        `)

    })

})
