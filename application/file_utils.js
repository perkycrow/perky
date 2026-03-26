export function pickFile (accept) {
    return new Promise(resolve => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = accept
        input.addEventListener('change', () => resolve(input.files[0] || null))
        input.click()
    })
}
