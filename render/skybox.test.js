import Skybox from './skybox.js'


describe('Skybox', () => {

    test('default values', () => {
        const sky = new Skybox()
        expect(sky.cubemap).toBe(null)
        expect(sky.skyColor).toEqual([0.2, 0.4, 0.8])
        expect(sky.horizonColor).toEqual([0.7, 0.8, 0.9])
        expect(sky.groundColor).toEqual([0.3, 0.3, 0.25])
    })


    test('with all options', () => {
        const tex = {id: 'cubemap'}
        const sky = new Skybox({
            cubemap: tex,
            skyColor: [0.01, 0.02, 0.06],
            horizonColor: [0.04, 0.04, 0.07],
            groundColor: [0.03, 0.03, 0.02]
        })
        expect(sky.cubemap).toBe(tex)
        expect(sky.skyColor).toEqual([0.01, 0.02, 0.06])
        expect(sky.horizonColor).toEqual([0.04, 0.04, 0.07])
        expect(sky.groundColor).toEqual([0.03, 0.03, 0.02])
    })


    test('partial options keep defaults', () => {
        const sky = new Skybox({skyColor: [1, 0, 0]})
        expect(sky.cubemap).toBe(null)
        expect(sky.skyColor).toEqual([1, 0, 0])
        expect(sky.horizonColor).toEqual([0.7, 0.8, 0.9])
        expect(sky.groundColor).toEqual([0.3, 0.3, 0.25])
    })

})
