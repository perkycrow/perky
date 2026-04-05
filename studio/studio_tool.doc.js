import {doc, section, text, code} from '../doc/runtime.js'


export default doc('StudioTool', {advanced: true}, () => {

    text(`
        Base class for studio tool views. Extends EditorComponent with
        built-in [[AppLayout@editor/layout]], [[PerkyStore@io]], CommandHistory,
        auto-save, and keyboard bindings. Subclass this to create tools like the
        [[AnimatorView@studio/animator]] or [[SceneView@studio/scene]].
    `)


    section('Subclassing', () => {

        text(`
            Override the builder methods to customize your tool. The base class
            handles layout assembly, lifecycle, and keyboard event routing.
        `)

        code('Minimal subclass', () => {
            class MyTool extends StudioTool {

                hasContext () {
                    return Boolean(this.data)
                }

                async init () {
                    const resource = await this.store.get('myTool')
                    if (resource) {
                        this.data = resource
                    }
                }

                buildContent () {
                    const el = document.createElement('div')
                    el.textContent = 'Tool content'
                    return el
                }

                autoSave () {
                    this.store.save('myTool', this.data)
                }

            }
        })

    })


    section('Auto-save', () => {

        text(`
            Call \`markDirty()\` when data changes. The tool will auto-save after
            a 2-second delay. Multiple \`markDirty()\` calls reset the timer,
            batching rapid changes. \`flushSave()\` saves immediately and is called
            automatically on \`beforeunload\` and disconnect.
        `)

        code('Usage', () => {
            // In your tool subclass:
            // onValueChange (newValue) {
            //     this.data.value = newValue
            //     this.markDirty()
            // }
        })

    })


    section('Keyboard Bindings', () => {

        text(`
            Define static \`actions\` and \`bindings\` on your subclass.
            Actions map action names to method names. Bindings map action
            names to key combinations (e.g., "Ctrl+Z", "Shift+Delete").
        `)

        code('Defining bindings', () => {
            class MyTool extends StudioTool {

                static actions = {
                    undo: 'handleUndo',
                    redo: 'handleRedo',
                    save: 'handleSave'
                }

                static bindings = {
                    undo: 'Ctrl+Z',
                    redo: ['Ctrl+Y', 'Ctrl+Shift+Z'],
                    save: 'Ctrl+S'
                }

                handleUndo () {
                    this.history.undo()
                }
                handleRedo () {
                    this.history.redo()
                }
                handleSave () {
                    this.flushSave()
                }

            }
        })

    })


    section('Builder Methods', () => {

        text(`
            Override these to customize the layout:
            - \`hasContext()\` — Return true when ready to initialize
            - \`init()\` — Called once context is available
            - \`buildHeaderStart()\` — Extra controls after back button
            - \`buildHeaderEnd()\` — Controls on the right side of header
            - \`buildContent()\` — Main content area
            - \`toolStyles()\` — Array of CSSStyleSheet for shadow DOM
            - \`autoSave()\` — Called when dirty state needs saving
        `)

    })


    section('Built-in Properties', () => {

        text(`
            Subclasses have access to:
            - \`store\` — [[PerkyStore@io]] for IndexedDB persistence
            - \`history\` — CommandHistory for undo/redo
            - \`appLayout\` — The [[AppLayout@editor/layout]] element
        `)

    })

})
