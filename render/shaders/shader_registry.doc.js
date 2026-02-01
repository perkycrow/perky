import {doc, section, text, code} from '../../doc/runtime.js'
import ShaderRegistry from './shader_registry.js'


export default doc('ShaderRegistry', {advanced: true}, () => {

    text(`
        Central registry for compiled shader programs. Registers shaders by ID,
        compiles them via [[ShaderProgram@render/shaders]], and maps object types
        to default shaders.
    `)


    section('Registering Shaders', () => {

        text(`
            Call \`register()\` with an ID and a descriptor containing vertex/fragment
            source, plus the names of uniforms and attributes to cache.
        `)

        code('Register a shader', () => {
            const registry = new ShaderRegistry(gl)

            registry.register('sprite', {
                vertex: vertexSource,
                fragment: fragmentSource,
                uniforms: ['uProjectionMatrix', 'uViewMatrix', 'uTexture'],
                attributes: ['aPosition', 'aTexCoord']
            })

            const program = registry.get('sprite')
            program.use()
        })

    })


    section('Default Shaders', () => {

        text(`
            Map object types to default shader IDs. The renderer uses this to
            pick the right shader for each object type automatically.
        `)

        code('Set and get defaults', () => {
            const registry = new ShaderRegistry(gl)

            registry.register('sprite', {vertex: vs, fragment: fs, uniforms: [], attributes: []})
            registry.register('primitive', {vertex: vs2, fragment: fs2, uniforms: [], attributes: []})

            registry.setDefault('sprite', 'sprite')
            registry.setDefault('primitive', 'primitive')

            const spriteShader = registry.getDefault('sprite')
        })

    })


    section('Unregister and Dispose', () => {

        text(`
            \`unregister(id)\` disposes a single program and removes it from defaults.
            \`dispose()\` cleans up everything.
        `)

        code('Clean up', () => {
            const registry = new ShaderRegistry(gl)

            registry.register('temp', {vertex: vs, fragment: fs, uniforms: [], attributes: []})
            registry.unregister('temp')

            registry.dispose()
        })

    })

})
