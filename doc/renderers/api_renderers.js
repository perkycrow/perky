export function getApiItems (api, cat) {
    if (cat.single) {
        return api[cat.key] ? [api[cat.key]] : []
    }

    return api[cat.key] || []
}


export function renderApiMember (member, file) {
    const wrapper = document.createElement('div')
    wrapper.className = 'api-member'

    const header = document.createElement('div')
    header.className = 'api-member-header'

    const signature = document.createElement('span')
    signature.className = 'api-member-name'

    if (member.params) {
        signature.textContent = `${member.name}(${member.params.join(', ')})`
    } else if (member.value) {
        signature.innerHTML = `${member.name} = <code>${member.value}</code>`
    } else {
        signature.textContent = member.name
    }

    header.appendChild(signature)

    if (member.line && file) {
        const lineLink = document.createElement('span')
        lineLink.className = 'api-member-line'
        lineLink.textContent = `:${member.line}`
        header.appendChild(lineLink)
    }

    const toggle = document.createElement('button')
    toggle.className = 'api-toggle'
    toggle.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z"/>
        </svg>
    `
    header.appendChild(toggle)

    wrapper.appendChild(header)

    const codeWrapper = document.createElement('div')
    codeWrapper.className = 'api-code-wrapper'

    const codeEl = document.createElement('perky-code')
    codeEl.code = member.source
    codeEl.setAttribute('no-header', '')
    codeWrapper.appendChild(codeEl)

    wrapper.appendChild(codeWrapper)

    toggle.addEventListener('click', () => {
        wrapper.classList.toggle('expanded')
    })

    header.addEventListener('click', e => {
        if (e.target !== toggle && !toggle.contains(e.target)) {
            wrapper.classList.toggle('expanded')
        }
    })

    return wrapper
}
