import {createStyleSheet} from '../../application/dom_utils.js'


export const storageInfoStyles = createStyleSheet(`
    :host {
        display: block;
        position: relative;
    }

    .title-btn {
        background: none;
        border: none;
        font-size: var(--font-size-lg);
        font-weight: 500;
        color: var(--fg-primary);
        font-family: var(--font-mono);
        cursor: pointer;
        padding: 4px 8px;
        border-radius: var(--radius-md);
        -webkit-tap-highlight-color: transparent;
        transition: background var(--transition-normal);
    }

    .title-btn:hover {
        background: var(--bg-hover);
    }

    .title-btn:active {
        background: var(--bg-secondary);
    }

    .popover {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: var(--spacing-sm);
        background: var(--bg-secondary);
        border: 1px solid var(--border, #333);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        min-width: 240px;
        z-index: 100;
        opacity: 0;
        pointer-events: none;
        transition: opacity var(--transition-normal);
    }

    .popover.open {
        opacity: 1;
        pointer-events: auto;
    }

    .popover-section {
        margin-bottom: var(--spacing-md);
    }

    .popover-section:last-child {
        margin-bottom: 0;
    }

    .popover-label {
        font-size: var(--font-size-sm);
        color: var(--fg-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: var(--spacing-xs);
    }

    .popover-value {
        font-size: var(--font-size-md);
        color: var(--fg-primary);
        font-weight: 500;
    }

    .storage-bar {
        height: 6px;
        background: var(--bg-primary);
        border-radius: 3px;
        margin-top: var(--spacing-sm);
        overflow: hidden;
    }

    .storage-fill {
        height: 100%;
        background: var(--accent);
        border-radius: 3px;
        transition: width var(--transition-normal);
    }
`)
