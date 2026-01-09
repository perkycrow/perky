export function createDescribeWrapper (describe, sectionId, depth) {
    const wrapper = document.createElement('div')
    wrapper.className = depth === 0 ? 'test-describe' : 'test-describe-nested'
    wrapper.id = depth <= 1 ? sectionId : ''

    const header = document.createElement('h2')
    header.className = depth === 0 ? 'test-describe-title' : 'test-describe-subtitle'
    header.textContent = describe.title
    wrapper.appendChild(header)

    return wrapper
}


export function addDescribeTocLink (tocList, title, sectionId, depth) {
    if (!tocList || depth > 1) {
        return
    }

    const tocLink = document.createElement('a')
    tocLink.className = depth === 0 ? 'doc-toc-link doc-toc-root' : 'doc-toc-link'
    tocLink.textContent = title
    tocLink.href = `#${sectionId}`
    tocList.appendChild(tocLink)
}


export function renderTestHook (name, hook) {
    const wrapper = document.createElement('div')
    wrapper.className = 'test-hook'

    const label = document.createElement('div')
    label.className = 'test-hook-label'
    label.textContent = name
    wrapper.appendChild(label)

    if (hook.source) {
        const codeEl = document.createElement('perky-code')
        codeEl.setAttribute('title', name)
        codeEl.code = hook.source
        wrapper.appendChild(codeEl)
    }

    return wrapper
}


export function renderTest (test) {
    const wrapper = document.createElement('div')
    wrapper.className = 'test-case'

    const codeEl = document.createElement('perky-code')
    codeEl.setAttribute('title', test.title)
    codeEl.code = test.source || ''
    wrapper.appendChild(codeEl)

    return wrapper
}
