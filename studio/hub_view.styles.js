import {createStyleSheet} from '../application/dom_utils.js'


export const hubViewStyles = createStyleSheet(`
    :host {
        display: block;
        height: 100%;
        width: 100%;
    }

    .hub-content {
        padding: var(--spacing-xl);
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    .section-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--fg-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: var(--spacing-lg);
        padding-left: var(--spacing-sm);
    }

    .animator-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: var(--spacing-lg);
    }

    .animator-card {
        background: var(--bg-secondary);
        border-radius: var(--radius-lg);
        overflow: hidden;
        cursor: pointer;
        transition: transform var(--transition-normal), background var(--transition-normal);
        -webkit-tap-highlight-color: transparent;
    }

    .animator-card:hover {
        background: var(--bg-hover);
        transform: scale(1.02);
    }

    .animator-card:active {
        transform: scale(0.98);
    }

    .card-preview {
        aspect-ratio: 1;
        background: var(--bg-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
    }

    .card-preview canvas {
        max-width: 80%;
        max-height: 80%;
        image-rendering: pixelated;
    }

    .card-preview .placeholder {
        width: 48px;
        height: 48px;
        background: var(--bg-hover);
        border-radius: var(--radius-md);
    }

    .card-info {
        padding: var(--spacing-md);
    }

    .card-title {
        font-size: var(--font-size-lg);
        font-weight: 500;
        color: var(--fg-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .card-meta {
        font-size: var(--font-size-sm);
        color: var(--fg-muted);
        margin-top: 2px;
    }

    .create-card {
        border: 2px dashed var(--border);
        background: transparent;
    }

    .create-card:hover {
        border-color: var(--accent);
        background: var(--bg-hover);
    }

    .create-card .card-preview {
        background: transparent;
    }

    .create-icon {
        font-size: 32px;
        color: var(--fg-muted);
    }

    .create-card:hover .create-icon {
        color: var(--accent);
    }

    .card-badge {
        position: absolute;
        top: var(--spacing-sm);
        right: var(--spacing-sm);
        padding: 2px 6px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        background: var(--accent);
        color: var(--bg-primary);
        border-radius: var(--radius-sm);
    }

    .card-badge.modified {
        background: var(--warning, #f90);
    }

    .card-checkbox {
        position: absolute;
        top: var(--spacing-sm);
        right: var(--spacing-sm);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid var(--fg-muted);
        background: var(--bg-secondary);
        display: none;
        align-items: center;
        justify-content: center;
        transition: all var(--transition-fast);
    }

    :host([selection-mode]) .card-checkbox {
        display: flex;
    }

    :host([selection-mode]) .card-badge {
        display: none;
    }

    .card-checkbox.selected {
        background: var(--accent);
        border-color: var(--accent);
    }

    .card-checkbox.selected::after {
        content: '';
        width: 8px;
        height: 8px;
        background: var(--bg-primary);
        border-radius: 50%;
    }

    :host([selection-mode]) .animator-card:not(.selectable) {
        opacity: 0.5;
        pointer-events: none;
    }

    :host([selection-mode]) .create-card {
        display: none;
    }

    .header-actions {
        display: flex;
        gap: 8px;
    }

    .header-actions button {
        padding: 8px 12px;
        background: transparent;
        border: none;
        color: var(--accent);
        font-size: var(--font-size-md);
        font-family: var(--font-mono);
        cursor: pointer;
        border-radius: var(--radius-md);
        min-height: 44px;
    }

    .header-actions button:disabled {
        opacity: 0.3;
        cursor: default;
        pointer-events: none;
        color: var(--fg-muted);
    }

    .header-actions .danger {
        color: #f66;
    }

    .header-actions .warning {
        color: var(--warning, #f90);
    }

    .default-actions {
        display: flex;
        gap: 8px;
    }

    .selection-actions {
        display: none;
    }

    :host([selection-mode]) .default-actions {
        display: none;
    }

    :host([selection-mode]) .selection-actions {
        display: flex;
        gap: 8px;
    }
`)
