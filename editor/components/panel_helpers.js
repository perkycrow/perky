export function createPanelHeader ({icon, title, buttons = [], onClick = null}) {
    const header = document.createElement('div')
    header.className = 'panel-header'

    const titleEl = document.createElement('div')
    titleEl.className = 'panel-title'
    titleEl.innerHTML = `<span class="panel-title-icon">${icon}</span> ${title}`

    const buttonsEl = document.createElement('div')
    buttonsEl.className = 'panel-buttons'

    const buttonRefs = {}

    for (const btn of buttons) {
        const btnEl = document.createElement('button')
        btnEl.className = 'panel-btn'
        btnEl.textContent = btn.icon
        btnEl.title = btn.title
        btnEl.addEventListener('click', (e) => {
            e.stopPropagation()
            btn.onClick?.()
        })
        buttonsEl.appendChild(btnEl)

        if (btn.id) {
            buttonRefs[btn.id] = btnEl
        }
    }

    header.appendChild(titleEl)
    header.appendChild(buttonsEl)

    if (onClick) {
        header.addEventListener('click', onClick)
    }

    return {header, buttons: buttonRefs}
}
