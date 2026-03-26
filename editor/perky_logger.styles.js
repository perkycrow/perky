import {createStyleSheet} from '../application/dom_utils.js'


export const loggerStyles = createStyleSheet(`
    :host {
        display: block;
        font-family: var(--font-mono);
        font-size: 12px;
        --logger-width: calc(100% - 20px);
        --logger-margin: 0 10px 10px;
        --logger-padding: 0;
        --logger-border: 1px solid var(--border);
        --logger-border-radius: 6px;
        --logger-bg: var(--bg-primary);
    }

    .logger-wrapper {
        width: var(--logger-width);
        margin: var(--logger-margin);
        position: relative;
    }

    .logger-controls {
        display: flex;
        gap: 2px;
        background: var(--logger-bg);
        padding: 4px 6px;
        border: var(--logger-border);
        border-bottom: none;
        border-radius: var(--logger-border-radius) var(--logger-border-radius) 0 0;
        width: fit-content;
        margin-left: auto;
        margin-right: 10px;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
    }

    .logger-wrapper:hover .logger-controls {
        opacity: 1;
        pointer-events: auto;
    }

    .logger {
        border-radius: var(--logger-border-radius);
        overflow: hidden;
        z-index: 100;
        position: relative;
        background: var(--logger-bg);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        border: var(--logger-border);
        color: var(--fg-primary);
        padding: var(--logger-padding);
        transition: opacity 0.2s ease;
    }

    .logger-faded {
        opacity: 0.4;
    }

    .logger-faded:hover {
        opacity: 1;
    }

    .logger-btn {
        width: 20px;
        height: 20px;
        padding: 3px;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--fg-muted);
        opacity: 0.5;
        transition: opacity 0.15s, color 0.15s;
    }

    .logger-btn:hover {
        opacity: 1;
    }

    .logger-btn.pinned {
        color: var(--accent);
        opacity: 0.8;
    }

    .logger-btn.pinned:hover {
        opacity: 1;
    }

    .logger-btn svg {
        width: 100%;
        height: 100%;
    }

    .logger-content {
        max-height: min(250px, 25vh);
        overflow-y: auto;
    }

    .logger-entry {
        padding: 3px 12px;
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 10px;
        line-height: 1.4;
    }

    .logger-indicator {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
        background: var(--fg-muted);
        opacity: 0.5;
        position: relative;
        top: 0.45em;
    }

    .log-info .logger-indicator {
        background: var(--fg-muted);
        opacity: 0.5;
    }

    .log-notice .logger-indicator {
        background: var(--fg-muted);
        opacity: 0.3;
    }

    .log-warn .logger-indicator {
        background: var(--status-warning);
        opacity: 1;
    }

    .log-error .logger-indicator {
        background: var(--status-error);
        opacity: 1;
        box-shadow: 0 0 4px var(--status-error);
    }

    .log-success .logger-indicator {
        background: var(--status-success);
        opacity: 1;
    }

    .logger-timestamp {
        color: var(--fg-muted);
        font-size: 10px;
        flex-shrink: 0;
        opacity: 0;
        transition: opacity 0.15s;
        margin-top: 1px;
    }

    .logger-entry:hover .logger-timestamp {
        opacity: 1;
    }

    .logger-copy-btn {
        width: 14px;
        height: 14px;
        padding: 2px;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--fg-muted);
        opacity: 0;
        transition: opacity 0.15s, color 0.15s;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .logger-copy-btn svg {
        width: 100%;
        height: 100%;
    }

    .logger-entry:hover .logger-copy-btn {
        opacity: 0.5;
    }

    .logger-copy-btn:hover {
        opacity: 1 !important;
        color: var(--accent);
    }

    .logger-message {
        flex-grow: 1;
        word-break: break-word;
        color: var(--fg-secondary);
    }

    .log-error .logger-message {
        color: var(--fg-primary);
    }

    .logger-spacer {
        height: 1px;
        background: var(--border);
        margin: 4px 12px;
        padding: 0;
        gap: 0;
    }

    .logger-title-entry {
        padding: 6px 12px 2px;
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--fg-muted);
    }


    .log-vec2 {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--bg-hover);
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 10px;
    }

    .log-vec2-label {
        color: var(--fg-muted);
        font-weight: 500;
    }

    .log-vec2-values {
        display: inline-flex;
        gap: 8px;
    }

    .log-vec2-component {
        display: inline-flex;
        gap: 4px;
    }

    .log-vec2-key {
        color: var(--fg-muted);
    }

    .log-vec2-value {
        color: var(--accent);
    }


    .log-object,
    .log-array,
    .log-module {
        display: inline-block;
        vertical-align: top;
    }

    .log-object-header,
    .log-array-header,
    .log-module-header {
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }

    .log-object-toggle,
    .log-array-toggle,
    .log-module-toggle {
        color: var(--fg-muted);
        font-size: 8px;
        width: 10px;
        user-select: none;
    }

    .log-object-preview,
    .log-array-preview {
        color: var(--fg-secondary);
    }

    .log-object-expanded,
    .log-array-expanded,
    .log-module-expanded {
        margin-left: 14px;
        padding: 4px 0;
        border-left: 1px solid var(--border);
        padding-left: 8px;
    }

    .log-object-row,
    .log-array-row,
    .log-module-row {
        display: flex;
        gap: 4px;
        padding: 1px 0;
    }

    .log-object-key,
    .log-module-key {
        color: var(--accent);
    }

    .log-array-index {
        color: var(--fg-muted);
        min-width: 20px;
    }

    .log-object-separator,
    .log-array-separator,
    .log-module-separator {
        color: var(--fg-muted);
    }

    .log-object-value,
    .log-array-value,
    .log-module-value {
        color: var(--fg-secondary);
    }

    .log-array-length {
        color: var(--fg-muted);
        font-style: italic;
    }


    .log-module-label {
        color: var(--fg-primary);
        background: var(--bg-hover);
        padding: 2px 8px;
        border-radius: 4px;
    }

    .log-module-category {
        color: var(--fg-muted);
        font-size: 0.9em;
    }

    .log-module-meta {
        border-bottom: 1px solid var(--border);
        padding-bottom: 4px;
        margin-bottom: 4px;
    }

    .log-module-meta-row .log-module-key {
        color: var(--fg-muted);
    }

    .log-module-meta-value {
        color: var(--fg-secondary);
    }

    .log-object-methods-row,
    .log-module-methods-row {
        flex-wrap: wrap;
    }

    .log-object-method-name,
    .log-module-method-name {
        white-space: nowrap;
    }

    @media (max-width: 1024px) {
        .logger-content {
            max-height: 150px;
        }

        .logger-controls.has-entries {
            opacity: 1;
            pointer-events: auto;
        }
    }
`)
