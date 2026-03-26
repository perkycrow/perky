import {createStyleSheet} from '../../application/dom_utils.js'


export const psdImporterStyles = createStyleSheet(`
    :host {
        display: contents;
    }

    .importer-content {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
    }

    .importer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--border);
        background: var(--bg-secondary);
    }

    .header-btn {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) var(--spacing-md);
        background: transparent;
        border: none;
        color: var(--accent);
        font-size: var(--font-size-md);
        font-family: var(--font-mono);
        cursor: pointer;
        border-radius: var(--radius-md);
        min-height: var(--touch-target);
        -webkit-tap-highlight-color: transparent;
    }

    .header-btn:active {
        background: var(--bg-hover);
    }

    .header-btn:disabled {
        opacity: 0.5;
        pointer-events: none;
    }

    .header-btn.primary {
        background: var(--accent);
        color: var(--bg-primary);
    }

    .header-title {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--fg-primary);
    }

    .importer-body {
        flex: 1;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    .step {
        display: none;
        height: 100%;
    }

    .step.active {
        display: flex;
        flex-direction: column;
    }

    .drop-zone {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: var(--spacing-xl);
        border: 2px dashed var(--border);
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: border-color var(--transition-normal), background var(--transition-normal);
        -webkit-tap-highlight-color: transparent;
    }

    .drop-zone:active,
    .drop-zone.dragover {
        border-color: var(--accent);
        background: var(--bg-hover);
    }

    .drop-zone-icon {
        width: 48px;
        height: 48px;
        margin-bottom: var(--spacing-lg);
        opacity: 0.6;
        color: var(--fg-muted);
    }

    .drop-zone-text {
        font-size: var(--font-size-lg);
        color: var(--fg-primary);
        margin-bottom: var(--spacing-sm);
    }

    .drop-zone-hint {
        font-size: var(--font-size-sm);
        color: var(--fg-muted);
    }

    .preview-section {
        padding: var(--spacing-xl);
    }

    .preview-canvas-container {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-primary);
        border-radius: var(--radius-lg);
        padding: var(--spacing-xl);
        margin-bottom: var(--spacing-lg);
        min-height: 150px;
    }

    .preview-canvas {
        max-width: 100%;
        max-height: 200px;
        image-rendering: pixelated;
    }

    .preview-dimensions {
        text-align: center;
        font-size: var(--font-size-sm);
        color: var(--fg-muted);
        margin-bottom: var(--spacing-xl);
    }

    .section-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--fg-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: var(--spacing-md);
    }

    .animation-tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-xl);
    }

    .animation-tag {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--bg-secondary);
        border-radius: var(--radius-md);
        font-size: var(--font-size-sm);
        color: var(--fg-primary);
    }

    .animation-tag span {
        color: var(--fg-muted);
    }

    .settings-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-md);
    }

    .settings-label {
        flex: 0 0 100px;
        font-size: var(--font-size-sm);
        color: var(--fg-muted);
    }

    .settings-input {
        flex: 1;
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }

    .size-input {
        width: 80px;
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        color: var(--fg-primary);
        font-family: var(--font-mono);
        font-size: var(--font-size-md);
        min-height: var(--touch-target);
    }

    .size-separator {
        color: var(--fg-muted);
    }

    .link-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--touch-target);
        height: var(--touch-target);
        background: transparent;
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        color: var(--fg-muted);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
    }

    .link-btn:active {
        background: var(--bg-hover);
    }

    .link-btn.active {
        color: var(--accent);
        border-color: var(--accent);
    }

    .link-btn svg {
        width: 18px;
        height: 18px;
    }

    .resize-select {
        flex: 1;
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        color: var(--fg-primary);
        font-family: var(--font-mono);
        font-size: var(--font-size-md);
        min-height: var(--touch-target);
    }

    .name-section {
        padding: var(--spacing-xl);
    }

    .name-input {
        width: 100%;
        padding: var(--spacing-md);
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        color: var(--fg-primary);
        font-family: var(--font-mono);
        font-size: var(--font-size-lg);
        min-height: var(--touch-target);
        margin-bottom: var(--spacing-lg);
    }

    .name-input:focus {
        outline: none;
        border-color: var(--accent);
    }

    .output-info {
        background: var(--bg-secondary);
        border-radius: var(--radius-md);
        padding: var(--spacing-lg);
        margin-bottom: var(--spacing-xl);
    }

    .output-info-title {
        font-size: var(--font-size-sm);
        color: var(--fg-muted);
        margin-bottom: var(--spacing-sm);
    }

    .output-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: var(--font-size-md);
        color: var(--fg-primary);
        padding: var(--spacing-xs) 0;
    }

    .output-item-icon {
        width: 16px;
        height: 16px;
        opacity: 0.6;
    }

    .create-btn {
        width: 100%;
        padding: var(--spacing-lg);
        background: var(--accent);
        border: none;
        border-radius: var(--radius-md);
        color: var(--bg-primary);
        font-family: var(--font-mono);
        font-size: var(--font-size-lg);
        font-weight: 600;
        cursor: pointer;
        min-height: var(--touch-target);
        -webkit-tap-highlight-color: transparent;
    }

    .create-btn:active {
        opacity: 0.9;
    }

    .create-btn:disabled {
        opacity: 0.5;
        pointer-events: none;
    }

    .progress-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-xl);
    }

    .progress-bar-container {
        width: 100%;
        max-width: 300px;
        height: 8px;
        background: var(--bg-primary);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: var(--spacing-lg);
    }

    .progress-bar {
        height: 100%;
        background: var(--accent);
        transition: width 0.2s ease;
    }

    .progress-text {
        font-size: var(--font-size-md);
        color: var(--fg-muted);
    }

    .error-message {
        color: var(--error);
        font-size: var(--font-size-sm);
        padding: var(--spacing-md);
        background: var(--bg-secondary);
        border-radius: var(--radius-md);
        margin: var(--spacing-md) var(--spacing-xl);
    }

    .hidden {
        display: none !important;
    }
`)
