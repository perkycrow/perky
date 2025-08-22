import RenderComposer from './render_composer'
import {vi, beforeEach, afterEach, describe, test, expect} from 'vitest'


const mockEffectComposer = {
    addPass: vi.fn(),
    removePass: vi.fn(), 
    insertPass: vi.fn(),
    render: vi.fn(),
    setSize: vi.fn(),
    dispose: vi.fn(),
    passes: []
}

const mockRenderPass = {
    type: 'RenderPass',
    enabled: true
}

const mockOutputPass = {
    type: 'OutputPass', 
    enabled: true
}

vi.mock('three/addons/postprocessing/EffectComposer', () => ({
    EffectComposer: vi.fn(() => mockEffectComposer)
}))

vi.mock('three/addons/postprocessing/RenderPass', () => ({
    RenderPass: vi.fn(() => mockRenderPass)
}))

vi.mock('three/addons/postprocessing/OutputPass', () => ({
    OutputPass: vi.fn(() => mockOutputPass)
}))


describe('RenderComposer', () => {
    let renderComposer
    let mockRenderer
    let mockScene  
    let mockCamera


    beforeEach(() => {
        vi.clearAllMocks()

        mockEffectComposer.passes = []

        mockRenderer = {
            setSize: vi.fn(),
            render: vi.fn(),
            domElement: document.createElement('canvas')
        }
        
        mockScene = {
            add: vi.fn(),
            remove: vi.fn(),
            children: []
        }
        
        mockCamera = {
            position: {x: 0, y: 0, z: 10},
            updateProjectionMatrix: vi.fn()
        }

        renderComposer = new RenderComposer({
            renderer: mockRenderer,
            scene: mockScene,
            camera: mockCamera
        })
    })


    afterEach(() => {
        vi.restoreAllMocks()
    })


    test('constructor', () => {
        expect(renderComposer.renderer).toBe(mockRenderer)
        expect(renderComposer.scene).toBe(mockScene)
        expect(renderComposer.camera).toBe(mockCamera)
        expect(renderComposer.composer).toBe(mockEffectComposer)
        expect(renderComposer.passes).toEqual([mockRenderPass])
        expect(renderComposer.renderPass).toBe(mockRenderPass)
        expect(renderComposer.outputPass).toBe(mockOutputPass)
    })


    test('setupBasicPasses', () => {
        const setupSpy = vi.spyOn(renderComposer, 'addPass')
        
        renderComposer.setupBasicPasses()
        
        expect(setupSpy).toHaveBeenCalledWith(mockRenderPass)
        expect(renderComposer.renderPass).toBe(mockRenderPass)
        expect(renderComposer.outputPass).toBe(mockOutputPass)
    })


    test('addPass', () => {
        const mockPass = {type: 'TestPass'}
        
        renderComposer.addPass(mockPass)
        
        expect(renderComposer.passes).toContain(mockPass)
        expect(mockEffectComposer.addPass).toHaveBeenCalledWith(mockPass)
    })


    test('removePass', () => {
        const mockPass = {type: 'TestPass'}

        renderComposer.addPass(mockPass)
        expect(renderComposer.passes).toHaveLength(2) // renderPass + mockPass

        renderComposer.removePass(mockPass)
        
        expect(renderComposer.passes).not.toContain(mockPass)
        expect(mockEffectComposer.removePass).toHaveBeenCalledWith(mockPass)
    })


    test('removePass non-existent pass', () => {
        const mockPass = {type: 'TestPass'}

        renderComposer.removePass(mockPass)
        
        expect(renderComposer.passes).not.toContain(mockPass)
        expect(mockEffectComposer.removePass).not.toHaveBeenCalled()
    })


    test('insertPass without OutputPass', () => {
        const mockPass = {type: 'TestPass'}
        renderComposer.outputPass = null

        vi.clearAllMocks()
        
        renderComposer.insertPass(mockPass, 0)
        
        expect(renderComposer.passes[0]).toBe(mockPass)
        expect(mockEffectComposer.insertPass).toHaveBeenCalledWith(mockPass, 0)
        expect(mockEffectComposer.removePass).not.toHaveBeenCalled()
        expect(mockEffectComposer.addPass).not.toHaveBeenCalled()
    })


    test('insertPass with OutputPass not in composer', () => {
        const mockPass = {type: 'TestPass'}
        mockEffectComposer.passes = []
        
        renderComposer.insertPass(mockPass, 0)
        
        expect(renderComposer.passes[0]).toBe(mockPass)
        expect(mockEffectComposer.insertPass).toHaveBeenCalledWith(mockPass, 0)
        expect(mockEffectComposer.removePass).not.toHaveBeenCalled()
        expect(mockEffectComposer.addPass).toHaveBeenCalledWith(mockOutputPass)
    })


    test('insertPass with OutputPass in composer', () => {
        const mockPass = {type: 'TestPass'}
        mockEffectComposer.passes = [mockOutputPass]
        vi.spyOn(mockEffectComposer.passes, 'includes').mockReturnValue(true)
        
        renderComposer.insertPass(mockPass, 0)
        
        expect(renderComposer.passes[0]).toBe(mockPass)
        expect(mockEffectComposer.removePass).toHaveBeenCalledWith(mockOutputPass)
        expect(mockEffectComposer.insertPass).toHaveBeenCalledWith(mockPass, 0)
        expect(mockEffectComposer.addPass).toHaveBeenCalledWith(mockOutputPass)
    })


    test('insertPass maintains OutputPass at end', () => {
        const mockPass1 = {type: 'TestPass1'}
        const mockPass2 = {type: 'TestPass2'}

        renderComposer.passes = [mockPass1]
        mockEffectComposer.passes = [mockPass1, mockOutputPass]
        vi.spyOn(mockEffectComposer.passes, 'includes').mockReturnValue(true)

        renderComposer.insertPass(mockPass2, 1)
        
        expect(renderComposer.passes).toEqual([mockPass1, mockPass2])
        expect(mockEffectComposer.removePass).toHaveBeenCalledWith(mockOutputPass)
        expect(mockEffectComposer.insertPass).toHaveBeenCalledWith(mockPass2, 1)
        expect(mockEffectComposer.addPass).toHaveBeenCalledWith(mockOutputPass)
    })


    test('render', () => {
        const deltaTime = 0.016
        
        renderComposer.render(deltaTime)
        
        expect(mockEffectComposer.render).toHaveBeenCalledWith(deltaTime)
    })


    test('render without deltaTime', () => {
        renderComposer.render()
        
        expect(mockEffectComposer.render).toHaveBeenCalledWith(undefined)
    })


    test('setSize', () => {
        const width = 1920
        const height = 1080
        
        renderComposer.setSize(width, height)
        
        expect(mockEffectComposer.setSize).toHaveBeenCalledWith(width, height)
    })


    test('dispose', () => {
        renderComposer.dispose()
        
        expect(mockEffectComposer.dispose).toHaveBeenCalled()
    })


    test('integration - multiple passes with proper ordering', () => {
        const pass1 = {type: 'Pass1'}
        const pass2 = {type: 'Pass2'}  
        const pass3 = {type: 'Pass3'}

        renderComposer.addPass(pass1)
        renderComposer.insertPass(pass2, 1)
        renderComposer.insertPass(pass3, 1)
        
        // Verify order: renderPass, pass3, pass2, pass1
        // insertPass operations insert at the specified index, shifting existing elements
        expect(renderComposer.passes).toEqual([mockRenderPass, pass3, pass2, pass1])
    })


    test('integration - remove pass from middle', () => {
        const pass1 = {type: 'Pass1'}
        const pass2 = {type: 'Pass2'}
        const pass3 = {type: 'Pass3'}

        renderComposer.addPass(pass1)
        renderComposer.addPass(pass2)
        renderComposer.addPass(pass3)
        
        expect(renderComposer.passes).toEqual([mockRenderPass, pass1, pass2, pass3])
        
        renderComposer.removePass(pass2)
        
        expect(renderComposer.passes).toEqual([mockRenderPass, pass1, pass3])
        expect(mockEffectComposer.removePass).toHaveBeenCalledWith(pass2)
    })


    test('passes array is properly maintained', () => {
        const pass1 = {type: 'Pass1'}
        const pass2 = {type: 'Pass2'}

        expect(renderComposer.passes).toContain(mockRenderPass)

        renderComposer.addPass(pass1)
        renderComposer.addPass(pass2)
        expect(renderComposer.passes).toHaveLength(3) // renderPass + pass1 + pass2

        renderComposer.removePass(pass1)
        expect(renderComposer.passes).toHaveLength(2) // renderPass + pass2
        expect(renderComposer.passes).toContain(mockRenderPass)
        expect(renderComposer.passes).toContain(pass2)
        expect(renderComposer.passes).not.toContain(pass1)
    })


    test('constructor calls setupBasicPasses', () => {
        const setupSpy = vi.spyOn(RenderComposer.prototype, 'setupBasicPasses')
        
        new RenderComposer({
            renderer: mockRenderer,
            scene: mockScene,
            camera: mockCamera
        })
        
        expect(setupSpy).toHaveBeenCalled()
        
        setupSpy.mockRestore()
    })


    test('properties are correctly assigned', () => {
        expect(renderComposer.renderer).toBe(mockRenderer)
        expect(renderComposer.scene).toBe(mockScene)
        expect(renderComposer.camera).toBe(mockCamera)
        expect(renderComposer.composer).toBeDefined()
        expect(Array.isArray(renderComposer.passes)).toBe(true)
    })

})
