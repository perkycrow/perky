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

        background: {type: 'image', url: './assets/images/background.png', config: {atlas: false}},


        wolf: {type: 'image', url: './assets/images/wolf.png', config: {atlas: 'characters'}},
        wolf_right: {type: 'image', url: './assets/images/wolf_right.png', config: {atlas: 'characters'}},
        wolf_up: {type: 'image', url: './assets/images/wolf_up.png', config: {atlas: 'characters'}},
        wolf_down: {type: 'image', url: './assets/images/wolf_down.png', config: {atlas: 'characters'}},
        pig: {type: 'image', url: './assets/images/pig.png', config: {atlas: 'characters'}},
        red: {type: 'image', url: './assets/images/red.png', config: {atlas: 'characters'}},
        granny: {type: 'image', url: './assets/images/granny.png', config: {atlas: 'characters'}},
        amalgam: {type: 'image', url: './assets/images/amalgam.png', config: {atlas: 'characters'}},


        brick: {type: 'image', url: './assets/images/brick.png', config: {atlas: 'projectiles'}},
        pie: {type: 'image', url: './assets/images/pie.png', config: {atlas: 'projectiles'}},
        cake: {type: 'image', url: './assets/images/cake.png', config: {atlas: 'projectiles'}},
        fireball: {type: 'image', url: './assets/images/fireball.png', config: {atlas: 'projectiles'}},


        click: {type: 'audio', url: './assets/audio/click.ogg', tags: ['sfx']},
        howl: {type: 'audio', url: './assets/audio/howl.ogg', tags: ['sfx']},
        throw: {type: 'audio', url: './assets/audio/throw.ogg', tags: ['sfx']},
        wound: {type: 'audio', url: './assets/audio/wound.ogg', tags: ['sfx']},
        music: {type: 'audio', url: './assets/audio/music.ogg', tags: ['music']}
    }
}

export default manifest
