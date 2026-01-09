import {doc, section, text, code, action, container, disclaimer, see, logger} from './runtime.js'


export default doc('Doc Runtime', {context: 'Core'}, () => {

    text(`
        The documentation DSL for writing interactive Perky docs.
        Define documentation pages using composable blocks like text, code, actions, and containers.
    `)


    section('Document Structure', () => {

        text(`
            A doc starts with the doc() function and contains blocks.
            Blocks can be organized into sections for better navigation.
        `)

        code('Basic document', () => {
            // doc(title, callback)
            // doc(title, options, callback)

            doc('My Module', () => {
                text('Introduction to the module.')
            })

            doc('My Module', {context: 'Core'}, () => {
                text('With context option.')
            })
        })

        code('Using sections', () => {
            doc('My Module', () => {
                section('Overview', () => {
                    text('First section content.')
                })

                section('Usage', () => {
                    text('Second section content.')
                })
            })
        })

    })


    section('Text Blocks', () => {

        text(`
            Text blocks render markdown content.
            Multi-line strings are automatically dedented.
        `)

        code('text()', () => {
            text('Simple paragraph.')

            text(`
                Multi-line content with automatic dedent.
                Supports **markdown** formatting.
            `)
        })

        code('disclaimer()', () => {
            // Renders as a highlighted callout
            disclaimer('This feature is experimental.')
        })

    })


    section('Code Blocks', () => {

        text(`
            Code blocks display syntax-highlighted JavaScript.
            The source is extracted from the function body.
        `)

        code('Static code', () => {
            code('Example', () => {
                const x = 1
                const y = 2
                return x + y
            })
        })

        code('Code with title', () => {
            code('Configuration', () => {
                const config = {
                    debug: true,
                    maxRetries: 3
                }
            })
        })

    })


    section('Actions', () => {

        text(`
            Actions are executable code blocks with a "Run" button.
            Use these for interactive demonstrations.
        `)

        code('action()', () => {
            action('Log message', () => {
                logger.log('Hello from action!')
            })
        })

        action('Live demo', () => {
            logger.log('This is an action block')
            logger.info('Click Run to execute')
        })

    })


    section('Containers', () => {

        text(`
            Containers render interactive DOM content.
            They receive a context object with helper methods.
        `)

        code('Basic container', () => {
            container(() => {
                // ctx.container is the DOM element
            })

            container({width: 400, height: 300}, () => {
                // With dimensions
            })
        })

        code('Container options', () => {
            container({
                width: 400,
                height: 300,
                title: 'Demo',
                preset: 'interactive',
                scrollable: true
            }, () => {})
        })

        container({height: 150, preset: 'centered'}, ctx => {
            const el = document.createElement('div')
            el.textContent = 'Container demo'
            el.style.color = '#fff'
            ctx.container.appendChild(el)
        })

    })


    section('Container Context', () => {

        text(`
            The container callback receives a context object with helper methods
            for building interactive UI.
        `)

        code('ctx.container', () => {
            container(ctx => {
                // Direct DOM access
                ctx.container.innerHTML = '<p>Content</p>'
            })
        })

        code('ctx.action()', () => {
            container(ctx => {
                ctx.action('Option A', () => {
                    logger.log('Selected A')
                })
                ctx.action('Option B', () => {
                    logger.log('Selected B')
                })
            })
        })

        code('ctx.slider()', () => {
            container(ctx => {
                ctx.slider('Speed', {min: 0, max: 100, default: 50}, value => {
                    logger.log('Speed:', value)
                })
            })
        })

        code('ctx.info() / ctx.display()', () => {
            container(ctx => {
                const updateInfo = ctx.info(() => 'Status: Ready')
                const updateDisplay = ctx.display(() => ['tag1', 'tag2'])

                // Later: updateInfo() or updateDisplay()
            })
        })

        code('ctx.hint()', () => {
            container(ctx => {
                ctx.hint('Press arrow keys to move')
            })
        })

    })


    section('Container Presets', () => {

        text(`
            Presets apply common styling configurations.
            Use preset option to quickly style containers.
        `)

        code('Available presets', () => {
            // 'interactive' - focusable, dark background, centered flex
            // 'interactive-alt' - same but different color
            // 'inspector' - padded with overflow
            // 'centered' - flex centered content
        })

        container({height: 100, preset: 'interactive'}, ctx => {
            ctx.hint('interactive preset')
        })

        container({height: 100, preset: 'inspector'}, ctx => {
            const el = document.createElement('div')
            el.textContent = 'inspector preset'
            el.style.color = '#fff'
            ctx.container.appendChild(el)
        })

    })


    section('Cross-References', () => {

        text(`
            Link to other documentation pages with the see() block.
        `)

        code('see()', () => {
            // Link to doc page
            see('Logger')

            // Link to specific section
            see('Logger', {section: 'Events'})

            // Link to API page
            see('Logger', {type: 'api'})

            // Link with category
            see('Application', {category: 'application'})
        })

        see('Logger')

    })


    section('Setup Functions', () => {

        text(`
            Setup functions run before each action/container in a section.
            Useful for initializing shared state.
        `)

        code('setup()', () => {
            section('With Setup', () => {
                setup(() => {
                    // Runs before each action/container
                    logger.clear()
                })

                action('First', () => {
                    logger.log('Action 1')
                })

                action('Second', () => {
                    logger.log('Action 2')
                })
            })
        })

    })

})
