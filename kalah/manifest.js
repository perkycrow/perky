export default {
    metadata: {
        name: 'Dreamless Stories - Kalah',
        version: '0.1.0',
        author: 'PerkyCrow'
    },
    sourceDescriptors: {
        images: {
            background: {
                url: '/assets/images/background.jpg',
                tags: ['preload']
            },
            symbol: {
                url: '/assets/images/symbol.png',
                tags: ['preload']
            }
        },
        fonts: {
            cinzelDecorativeRegular: {
                url: '/assets/fonts/cinzel-decorative-v18-latin-regular.woff2',
                config: {
                    family: 'Cinzel Decorative',
                    style: 'normal',
                    weight: '400'
                },
                tags: ['preload']
            },
            cinzelDecorative700: {
                url: '/assets/fonts/cinzel-decorative-v18-latin-700.woff2',
                config: {
                    family: 'Cinzel Decorative',
                    style: 'normal',
                    weight: '700'
                },
                tags: ['preload']
            },
            cinzelDecorative900: {
                url: '/assets/fonts/cinzel-decorative-v18-latin-900.woff2',
                config: {
                    family: 'Cinzel Decorative',
                    style: 'normal',
                    weight: '900'
                },
                tags: ['preload']
            }
        }
    }
}
