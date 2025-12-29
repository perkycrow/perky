import BaseEditorComponent from '../base_editor_component.js'
import {buildDockStyles} from './devtools_styles.js'
import {getSidebarTools} from './devtools_registry.js'


function createDockButton (icon, title, onClick) {
    const button = document.createElement('button')
    button.className = 'dock-button'
    button.innerHTML = icon
    button.title = title
    button.addEventListener('click', onClick)
    return button
}


export default class DevToolsDock extends BaseEditorComponent {

    #state = null
    #dockEl = null
    #toolButtons = new Map()
    #loggerButton = null
    #spotlightButton = null


    #minimized = true

    connectedCallback () {
        this.#buildDOM()
    }


    setState (state) {
        this.#state = state

        state.addEventListener('tool:change', () => this.#updateActiveStates())
        state.addEventListener('sidebar:open', () => this.#updateActiveStates())
        state.addEventListener('sidebar:close', () => this.#updateActiveStates())
        state.addEventListener('logger:open', () => this.#updateLoggerState())
        state.addEventListener('logger:close', () => this.#updateLoggerState())
    }


    refreshTools () {
        this.#render()
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        this.#dockEl = document.createElement('div')
        this.#dockEl.className = 'devtools-dock'

        this.#render()

        this.shadowRoot.appendChild(this.#dockEl)
    }


    #render () {
        if (!this.#dockEl) {
            return
        }

        this.#dockEl.innerHTML = ''
        this.#toolButtons.clear()
        this.#dockEl.classList.toggle('minimized', this.#minimized)

        if (this.#minimized) {
            this.#renderMinimized()
        } else {
            this.#renderExpanded()
        }
    }


    #renderMinimized () {
        const crowBtn = createDockButton(
            '',
            'Open DevTools',
            () => {
                this.#minimized = false
                this.#render()

                // Auto-open Explorer
                this.#state?.toggleTool('explorer')
                if (!this.#state?.sidebarOpen) {
                    this.#state?.toggleSidebar()
                }
            }
        )

        // Version 9: Hand-drawn Line Art (From Reference)
        // Style: White outlines/strokes on transparent background.
        // Orientation: Flipped to face LEFT (UX inconsistency check: Reference faces Right, but Dock opens Left. Previous feedback requested Left-facing. I will flip it to match the logical direction).
        crowBtn.innerHTML = `
            <svg viewBox="0 0 24 24">
                 <!-- Main Group Flipped to face Left -->
                 <g transform="scale(-1, 1) translate(-24, 0)" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                     
                     <!-- Top Hat -->
                     <!-- Slightly jaunty angle -->
                     <path d="M10 6 L14 6 L13 3 L10 3 Z" /> <!-- Crown -->
                     <path d="M9 6 L15 6" /> <!-- Brim -->

                     <!-- Head & Beak -->
                     <!-- Starting from back of neck, going up over head, beak, down front -->
                     <path d="
                        M 10 18            <!-- Neck Back -->
                        Q 9 14 10 10       <!-- Back of Head -->
                        C 10 7 13 7 15 9   <!-- Top of Head -->
                        L 20 11            <!-- Beak Top -->
                        Q 22 12 20 13      <!-- Beak Tip -->
                        L 16 12            <!-- Beak Mouth Line -->
                        Q 16 15 15 18      <!-- Chest/Neck Front -->
                     " />

                     <!-- Eye (Circle with pupil) -->
                     <circle cx="13.5" cy="10.5" r="1.5" />
                     <circle cx="14" cy="10.5" r="0.5" fill="currentColor" stroke="none" />
                 </g>
            </svg>
        `

        // Let's match the reference image's specific "sketchy" vibe better.
        // It has variable width strokes (calligraphic).
        // Since we are using SVG, we can mimic this with filled paths or variable stroke-width specific paths.
        // For reliability, let's use a clean monoline first, but style it to look like the drawing.

        crowBtn.innerHTML = `
            <svg viewBox="0 0 24 24">
                <g transform="scale(-1, 1) translate(-24, 0)" fill="currentColor">
                    <!-- Eye -->
                    <path d="M12 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                    
                    <!-- Head & Body Outline (Variable width simulation) -->
                    <!-- Drawing the "White" parts as a filled shape -->
                    
                    <!-- Hat -->
                    <path d="M10 5h4l-0.5-2h-3L10 5zm-1 1h6v1H9V6z"/>
                    
                    <!-- Beak -->
                    <path d="M16 8c2 0 4 1 6 3-1 1-3 1-5 0l-1-1v-2z"/> 
                    <!-- Wait, that's not good. Let's trace the "Vibe". -->
                </g>
            </svg>
        `

        // V9.1: Clean Stroke approximation of the visual
        crowBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <!-- Flipped to Look Left -->
                <g transform="scale(-1, 1) translate(-24, 0)">
                    <!-- Hat -->
                    <path d="M 11 5 L 15 5" /> <!-- Brim -->
                    <path d="M 12 5 L 12.5 2.5 L 14.5 2.5 L 14 5" /> <!-- Crown -->
                    
                    <!-- Head -->
                    <path d="M 13 5 C 16 5 18 7 18 10" /> <!-- Forehead -->
                    
                    <!-- Beak -->
                    <path d="M 18 10 L 22 11.5 L 17 13" /> 
                    
                    <!-- Neck/Chest -->
                    <path d="M 17 13 C 17 16 16 19 14 21" />
                    
                    <!-- Back of Head/Neck -->
                    <path d="M 11 5 C 9 6 8 12 8 18" />
                    
                    <!-- Eye -->
                    <circle cx="15" cy="9" r="1.5" />
                </g>
            </svg>
        `

        // V9.2: "Organic" Sketch Style
        // The image has disconnected lines.
        crowBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                 <g transform="scale(-1, 1) translate(-24, 0)">
                     <!-- Hat Crown -->
                     <path d="M11 5l0.5-2h3l0.5 2" />
                     <!-- Hat Brim -->
                     <path d="M10 6h7" />
                     
                     <!-- Face Profile -->
                     <path d="M12 6c2 0 4 1 5 3" /> <!-- Forehead -->
                     <path d="M22 11c-2-1-4-2-5-2" /> <!-- Beak Top -->
                     <path d="M22 11c-1 1-3 2-5 1" /> <!-- Beak Bottom -->
                     <path d="M17 12c0 3-1 6-4 9" /> <!-- Chest -->
                     
                     <!-- Back -->
                     <path d="M11 6c-2 2-2 8 0 14" />
                     
                     <!-- Eye -->
                     <circle cx="15" cy="9" r="1.2" fill="currentColor" stroke="none"/>
                     <circle cx="15" cy="9" r="2.5" stroke-width="1.5"/>
                 </g>
            </svg>
        `

        // V9.3: Closest match to "The Idea"
        // White lines. Black background (transparent in our case).
        // Let's center it nicely looking LEFT.
        crowBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <!-- Looking Left -->
                <!-- Hat -->
                <path d="M10 5 L14 5 M 11 5 L 11.5 2.5 H 13.5 L 13 5"/> 
                
                <!-- Eye (Donut) -->
                <circle cx="10" cy="10" r="2" />
                
                <!-- Head/Beak Path -->
                <!-- Top Head -->
                <path d="M 12 5 C 9 5 8 7 8 9" />
                <!-- Beak -->
                <path d="M 8 9 L 3 11 L 8 13" />
                <!-- Front Neck -->
                <path d="M 8 13 C 9 16 11 19 14 21" />
                <!-- Back Neck -->
                <path d="M 14 5 C 16 6 17 12 17 20" />
            </svg>
        `

        this.#dockEl.appendChild(crowBtn)
    }


    #renderExpanded () {
        const tools = getSidebarTools()

        // Tools
        for (const Tool of tools) {
            const button = this.#createToolButton(Tool)
            this.#toolButtons.set(Tool.toolId, button)
            this.#dockEl.appendChild(button)
        }

        if (tools.length > 0) {
            const separator = document.createElement('div')
            separator.className = 'dock-separator'
            this.#dockEl.appendChild(separator)
        }

        // Logger
        this.#loggerButton = createDockButton(
            '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
            'Logger',
            () => {
                this.#state?.toggleLogger()
            }
        )
        this.#dockEl.appendChild(this.#loggerButton)

        // Spotlight
        this.#spotlightButton = createDockButton(
            '<svg viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>',
            'Spotlight (Cmd+K)',
            () => {
                this.#state?.toggleSpotlight()
            }
        )
        this.#dockEl.appendChild(this.#spotlightButton)

        // Separator
        const separator2 = document.createElement('div')
        separator2.className = 'dock-separator'
        this.#dockEl.appendChild(separator2)

        // Collapse Button
        const collapseBtn = createDockButton(
            '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>',
            'Collapse Dock',
            () => {
                this.#minimized = true
                this.#render()

                // Close sidebar when collapsing
                if (this.#state?.sidebarOpen) {
                    this.#state.closeSidebar()
                }
            }
        )
        this.#dockEl.appendChild(collapseBtn)

        this.#updateActiveStates()
        this.#updateLoggerState()
    }


    #createToolButton (Tool) {
        const button = createDockButton(Tool.toolIcon, Tool.toolName, () => {
            this.#state?.toggleTool(Tool.toolId)
        })
        button.dataset.toolId = Tool.toolId
        return button
    }


    #updateActiveStates () {
        const activeTool = this.#state?.activeTool
        const sidebarOpen = this.#state?.sidebarOpen

        this.#dockEl.classList.toggle('sidebar-open', sidebarOpen)

        for (const [toolId, button] of this.#toolButtons) {
            const isActive = sidebarOpen && activeTool === toolId
            button.classList.toggle('active', isActive)
        }
    }


    #updateLoggerState () {
        if (this.#loggerButton) {
            this.#loggerButton.classList.toggle('active', this.#state?.loggerOpen)
        }
    }

}


const STYLES = buildDockStyles()


customElements.define('devtools-dock', DevToolsDock)
