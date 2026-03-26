import {createStyleSheet} from '../../application/dom_utils.js'


export const conflictResolverStyles = createStyleSheet(`
    :host {
        display: block;
    }

    .conflict-content {
        padding: var(--spacing-xl);
        max-width: 560px;
        width: 90vw;
    }

    .conflict-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--fg-primary);
        margin-bottom: var(--spacing-sm);
    }

    .conflict-subtitle {
        font-size: var(--font-size-md);
        color: var(--fg-muted);
        margin-bottom: var(--spacing-xl);
        line-height: 1.4;
    }

    .conflict-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xl);
        margin-bottom: var(--spacing-xl);
    }

    .conflict-item {
        background: var(--bg-secondary);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
    }

    .conflict-name {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--fg-primary);
        margin-bottom: var(--spacing-md);
    }

    .conflict-columns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-md);
    }

    .version-card {
        padding: var(--spacing-lg);
        border-radius: var(--radius-md);
        border: 2px solid var(--border, #333);
        cursor: pointer;
        transition: border-color var(--transition-normal), background var(--transition-normal);
        -webkit-tap-highlight-color: transparent;
        min-height: var(--touch-target, 44px);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
    }

    .version-card:hover {
        background: var(--bg-hover);
    }

    .version-card.selected {
        border-color: var(--accent);
        background: color-mix(in srgb, var(--accent) 8%, transparent);
    }

    .version-label {
        font-size: var(--font-size-md);
        font-weight: 600;
        color: var(--fg-primary);
    }

    .version-card.selected .version-label {
        color: var(--accent);
    }

    .version-detail {
        font-size: var(--font-size-sm);
        color: var(--fg-muted);
    }

    .version-date {
        font-size: var(--font-size-sm);
        color: var(--fg-muted);
        margin-top: var(--spacing-xs);
    }

    .conflict-actions {
        display: flex;
        justify-content: flex-end;
    }

    .continue-btn {
        padding: var(--spacing-md) var(--spacing-xl);
        background: var(--accent);
        color: var(--bg-primary);
        border: none;
        border-radius: var(--radius-md);
        font-size: var(--font-size-md);
        font-family: var(--font-mono);
        font-weight: 600;
        cursor: pointer;
        min-height: var(--touch-target, 44px);
        transition: opacity var(--transition-normal);
    }

    .continue-btn:hover {
        opacity: 0.9;
    }

    .continue-btn:active {
        opacity: 0.8;
    }
`)
