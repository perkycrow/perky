

export const controlsCSS = `

    input[type="text"],
    input[type="number"],
    input[type="search"],
    textarea {
        appearance: none;
        background: transparent;
        color: var(--fg-primary);
        border: none;
        padding: 0;
        height: auto;
        font-family: inherit;
        font-size: inherit;
    }

    input:hover,
    textarea:hover {
        background: transparent;
    }

    input:focus,
    textarea:focus {
        outline: none;
        background: transparent;
    }

    input:disabled,
    textarea:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }


    select {
        appearance: none;
        background: var(--bg-secondary);
        color: var(--fg-primary);
        border: none;
        border-radius: var(--radius-md);
        padding: 0 var(--spacing-lg) 0 var(--spacing-sm);
        height: var(--input-height);
        font-family: inherit;
        font-size: inherit;
        cursor: pointer;
        transition: background var(--transition-fast);
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239898a0' d='M3 4.5L6 8l3-3.5H3z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 8px center;
    }

    select:hover {
        background-color: var(--bg-hover);
    }

    select:focus {
        outline: none;
        background-color: var(--bg-hover);
    }


    button {
        appearance: none;
        background: var(--bg-secondary);
        color: var(--fg-secondary);
        border: none;
        border-radius: var(--radius-md);
        padding: 0 var(--spacing-md);
        height: var(--input-height);
        min-width: var(--input-height);
        font-family: inherit;
        font-size: inherit;
        font-weight: 500;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-xs);
        transition: background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
    }

    button:hover {
        background: var(--bg-hover);
        color: var(--fg-primary);
    }

    button:active {
        transform: scale(0.96);
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }


    button.primary {
        background: var(--accent);
        color: var(--bg-primary);
    }

    button.primary:hover {
        background: var(--accent-hover);
        color: var(--bg-primary);
    }

    button.danger {
        background: var(--status-error);
        color: white;
    }

    button.danger:hover {
        background: #ef5350;
        color: white;
    }

    button.ghost {
        background: transparent;
        color: var(--fg-secondary);
    }

    button.ghost:hover {
        background: var(--bg-hover);
        color: var(--fg-primary);
    }


    button.active,
    button[aria-pressed="true"] {
        background: var(--accent);
        color: var(--bg-primary);
    }


    button.icon-only {
        padding: 0;
        width: var(--input-height);
    }


    button.success {
        background: var(--status-success);
        color: var(--bg-primary);
    }


    label {
        color: var(--fg-secondary);
        font-size: var(--font-size-sm);
        user-select: none;
        -webkit-user-select: none;
    }

    label.draggable {
        cursor: ew-resize;
    }
`
