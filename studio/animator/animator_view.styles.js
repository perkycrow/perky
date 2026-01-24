import {createSheet} from '../../editor/styles/index.js'


export const animatorViewStyles = createSheet(`
    :host {
        display: block;
        height: 100%;
        background: var(--bg-primary);
        color: var(--fg-primary);
        font-family: var(--font-mono);
        font-size: 12px;
        position: relative;
    }

    app-layout {
        height: 100%;
    }

    .animator-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        position: relative;
    }

    .empty {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--fg-muted);
    }


    .preview-section {
        flex: 1;
        min-height: 200px;
        overflow: hidden;
        position: relative;
    }

    .preview-section animation-preview {
        width: 100%;
        height: 100%;
    }


    .header-controls {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
    }

    .toolbar-btn {
        appearance: none;
        background: var(--bg-tertiary);
        color: var(--fg-secondary);
        border: none;
        border-radius: var(--radius-md);
        padding: 10px 16px;
        font-family: inherit;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast), transform 0.1s;
        min-height: var(--touch-target);
        min-width: var(--touch-target);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .toolbar-btn:hover {
        background: var(--bg-hover);
        color: var(--fg-primary);
    }

    .toolbar-btn:active {
        transform: scale(0.96);
    }

    .toolbar-btn svg {
        width: 18px;
        height: 18px;
        stroke: currentColor;
        fill: none;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    .toolbar-btn-primary {
        background: var(--accent);
        color: var(--bg-primary);
        font-size: 20px;
        font-weight: 400;
    }

    .toolbar-btn-primary:hover {
        background: var(--accent-hover);
        color: var(--bg-primary);
    }

    .toolbar-toggle {
        font-size: 16px;
    }

    .toolbar-toggle.active {
        background: var(--accent);
        color: var(--bg-primary);
    }

    .toolbar-btn.success {
        background: var(--status-success);
        color: var(--bg-primary);
    }


    .timeline-section {
        flex-shrink: 0;
        background: var(--bg-secondary);
        padding: var(--spacing-md) var(--spacing-lg);
        min-height: 120px;
        overflow: hidden;
        max-width: 100%;
    }
`)


export const frameEditorStyles = createSheet(`
    .frame-editor {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
    }

    .frame-editor-preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-sm);
    }

    .frame-editor-canvas {
        background: var(--bg-tertiary);
        border-radius: var(--radius-md);
        image-rendering: pixelated;
        image-rendering: crisp-edges;
    }

    .frame-editor-name {
        font-size: var(--font-size-sm);
        color: var(--fg-muted);
        text-align: center;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .frame-editor-section {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .frame-editor-label {
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--fg-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .frame-editor-duration {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
    }

    .frame-editor-duration slider-input {
        flex: 1;
        min-width: 0;
    }

    .frame-editor-duration number-input {
        flex-shrink: 0;
    }

    .frame-editor-events {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .event-chip {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-xs);
        background: var(--bg-tertiary);
        border-radius: var(--radius-md);
        padding: var(--spacing-xs) var(--spacing-sm);
        font-size: var(--font-size-sm);
        color: var(--fg-primary);
    }

    .event-chip-remove {
        appearance: none;
        background: transparent;
        border: none;
        color: var(--fg-muted);
        font-size: 14px;
        width: 20px;
        height: 20px;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm);
        transition: background var(--transition-fast), color var(--transition-fast);
    }

    .event-chip-remove:hover {
        background: var(--status-error);
        color: white;
    }

    .event-suggestions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-xs);
    }

    .event-suggestion {
        appearance: none;
        background: transparent;
        border: 1px dashed var(--border);
        border-radius: var(--radius-md);
        padding: var(--spacing-xs) var(--spacing-sm);
        font-size: var(--font-size-sm);
        font-family: var(--font-mono);
        color: var(--fg-muted);
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
    }

    .event-suggestion:hover {
        background: var(--bg-hover);
        border-color: var(--fg-muted);
        color: var(--fg-primary);
    }

    .event-add-row {
        display: flex;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-xs);
    }

    .event-input {
        flex: 1;
        background: var(--bg-tertiary);
        border: none;
        border-radius: var(--radius-md);
        padding: var(--spacing-sm) var(--spacing-md);
        font-size: var(--font-size-sm);
        font-family: var(--font-mono);
        color: var(--fg-primary);
        min-height: var(--touch-target);
    }

    .event-input:focus {
        outline: 1px solid var(--accent);
    }

    .event-input::placeholder {
        color: var(--fg-muted);
    }

    .event-add-btn {
        appearance: none;
        background: var(--accent);
        border: none;
        border-radius: var(--radius-md);
        padding: var(--spacing-sm) var(--spacing-md);
        font-size: var(--font-size-sm);
        font-family: var(--font-mono);
        font-weight: 500;
        color: var(--bg-primary);
        cursor: pointer;
        min-height: var(--touch-target);
        min-width: var(--touch-target);
        transition: background var(--transition-fast);
    }

    .event-add-btn:hover {
        background: var(--accent-hover);
    }
`)


export const settingsStyles = createSheet(`
    .animation-settings {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
        padding-top: calc(28px + var(--spacing-sm));
    }

    .settings-section {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
    }

    .settings-label {
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--fg-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .settings-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
    }

    .settings-row slider-input {
        flex: 1;
        min-width: 0;
    }

    .settings-row number-input {
        flex-shrink: 0;
    }

    .direction-pad {
        display: grid;
        grid-template-columns: repeat(3, 36px);
        grid-template-rows: repeat(3, 36px);
        gap: 2px;
        justify-content: start;
    }

    .direction-btn {
        appearance: none;
        background: var(--bg-tertiary);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        color: var(--fg-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
    }

    .direction-btn:hover {
        background: var(--bg-hover);
        color: var(--fg-primary);
    }

    .direction-btn.active {
        background: var(--accent);
        border-color: var(--accent);
        color: var(--bg-primary);
    }

    .direction-btn svg {
        width: 16px;
        height: 16px;
        stroke: currentColor;
        fill: none;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    .direction-btn.center {
        background: transparent;
        border-color: transparent;
        cursor: default;
    }

    .spritesheet-settings {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
        padding-top: calc(28px + var(--spacing-sm));
    }

    .anchor-preview-wrapper {
        position: relative;
        background: var(--bg-tertiary);
        border-radius: var(--radius-md);
        overflow: hidden;
        width: 100%;
        aspect-ratio: 1;
    }

    .anchor-preview-canvas {
        display: block;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
    }

    .anchor-handle {
        position: absolute;
        width: 12px;
        height: 12px;
        background: var(--accent);
        border: 2px solid white;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        cursor: grab;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        z-index: 1;
    }

    .anchor-handle:active {
        cursor: grabbing;
    }

    .anchor-inputs {
        gap: var(--spacing-md);
    }

    .anchor-inputs number-input {
        flex: 1;
    }
`)
