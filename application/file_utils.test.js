import {describe, test, expect, vi} from 'vitest'
import {pickFile} from './file_utils.js'


describe('file_utils', () => {

    test('pickFile', async () => {
        const mockFile = new File(['test'], 'test.png', {type: 'image/png'})
        const mockInput = {
            type: '',
            accept: '',
            addEventListener: vi.fn(),
            click: vi.fn(),
            files: [mockFile]
        }

        vi.spyOn(document, 'createElement').mockReturnValueOnce(mockInput)

        const promise = pickFile('.png')

        expect(mockInput.type).toBe('file')
        expect(mockInput.accept).toBe('.png')
        expect(mockInput.click).toHaveBeenCalled()
        expect(mockInput.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))

        const changeHandler = mockInput.addEventListener.mock.calls[0][1]
        changeHandler()

        const result = await promise
        expect(result).toBe(mockFile)
    })


    test('pickFile returns null when no file selected', async () => {
        const mockInput = {
            type: '',
            accept: '',
            addEventListener: vi.fn(),
            click: vi.fn(),
            files: []
        }

        vi.spyOn(document, 'createElement').mockReturnValueOnce(mockInput)

        const promise = pickFile('.psd')

        const changeHandler = mockInput.addEventListener.mock.calls[0][1]
        changeHandler()

        const result = await promise
        expect(result).toBeNull()
    })

})
