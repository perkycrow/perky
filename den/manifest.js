const manifest = {
    config: {
        name: 'Mistbrewer',
        audio: {
            masterVolume: 0.5,
            channels: {
                sfx: {muted: true, volume: 0.5},
                ambiance: {muted: true},
                music: {muted: false}
            }
        }
    },
    assets: {
        background: {type: 'image', url: './assets/images/background.png'},
        wolf: {type: 'image', url: './assets/images/wolf.png'},
        wolf_right: {type: 'image', url: './assets/images/wolf_right.png'},
        wolf_up: {type: 'image', url: './assets/images/wolf_up.png'},
        wolf_down: {type: 'image', url: './assets/images/wolf_down.png'},
        pig: {type: 'image', url: './assets/images/pig.png'},
        red: {type: 'image', url: './assets/images/red.png'},
        granny: {type: 'image', url: './assets/images/granny.png'},
        amalgam: {type: 'image', url: './assets/images/amalgam.png'},
        brick: {type: 'image', url: './assets/images/brick.png'},
        pie: {type: 'image', url: './assets/images/pie.png'},
        cake: {type: 'image', url: './assets/images/cake.png'},
        fireball: {type: 'image', url: './assets/images/fireball.png'},

        click: {type: 'audio', url: './assets/audio/click.ogg', tags: ['sfx']},
        howl: {type: 'audio', url: './assets/audio/howl.ogg', tags: ['sfx']},
        throw: {type: 'audio', url: './assets/audio/throw.ogg', tags: ['sfx']},
        wound: {type: 'audio', url: './assets/audio/wound.ogg', tags: ['sfx']},
        music: {type: 'audio', url: './assets/audio/music.ogg', tags: ['music']}
    }
}

export default manifest
