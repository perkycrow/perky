import {test, expect, beforeEach} from 'vitest'
import Vault from './vault.js'
import Artifact from './artifact.js'
import Factory from '../libs/factory.js'


class CustomArtifact extends Artifact {
    static skill = 'ruin'
}

class OtherArtifact extends Artifact {}


let factory
let vault

beforeEach(() => {
    factory = new Factory('Artifact', [CustomArtifact, OtherArtifact])
    vault = new Vault({artifactFactory: factory})
})


test('getArtifacts', () => {
    const customArtifact = new CustomArtifact({stack: 2})
    const otherArtifact  = new OtherArtifact({stack: 3})

    vault.artifacts = [customArtifact, otherArtifact]

    expect(vault.getArtifacts()).toEqual([customArtifact, otherArtifact])
    expect(vault.getArtifacts({id: 'custom'})).toEqual([customArtifact])
    expect(vault.getArtifacts({stack: 3})).toEqual([otherArtifact])
    expect(vault.getArtifacts(artifact => artifact.stack >= 2)).toEqual([customArtifact, otherArtifact])
})


test('getArtifact', () => {
    const customArtifact = new CustomArtifact()
    const otherArtifact  = new OtherArtifact()

    vault.artifacts = [customArtifact, otherArtifact]

    expect(vault.getArtifact('custom')).toEqual(customArtifact)
    expect(vault.getArtifact('other')).toEqual(otherArtifact)
})


test('addArtifact', () => {
    const customArtifact = vault.addArtifact({id: 'custom', stack: 2})
    const otherArtifact  = vault.addArtifact({id: 'other', stack: 3})

    expect(customArtifact).toBeInstanceOf(CustomArtifact)
    expect(customArtifact.stack).toEqual(2)
    expect(otherArtifact).toBeInstanceOf(OtherArtifact)
    expect(otherArtifact.stack).toEqual(3)

    const newArtifact = vault.addArtifact({id: 'other', stack: 1})
    expect(newArtifact).toBeInstanceOf(OtherArtifact)
    expect(newArtifact).toEqual(otherArtifact)
    expect(newArtifact.stack).toEqual(4)
})


test('export', () => {
    const customArtifact = new CustomArtifact({stack: 2})
    const otherArtifact  = new OtherArtifact({stack: 3})

    vault.artifacts = [customArtifact, otherArtifact]

    expect(vault.export()).toEqual({
        artifacts: [
            {id: 'custom', skill: 'ruin', type: 'passive', stack: 2},
            {id: 'other',  skill: null,   type: 'passive', stack: 3}
        ]
    })
})


test('provideArtifact', () => {
    class NewArtifact extends Artifact {
        static id = 'newArtifact'
    }

    const freshVault = new Vault()
    freshVault.provideArtifact(NewArtifact)

    const artifact = freshVault.addArtifact({id: 'newArtifact'})
    expect(artifact).toBeInstanceOf(NewArtifact)
})


test('createArtifact', () => {
    const artifact = vault.createArtifact({id: 'custom', stack: 5})

    expect(artifact).toBeInstanceOf(CustomArtifact)
    expect(artifact.stack).toEqual(5)
})


test('restore', () => {
    vault.addArtifact({id: 'custom', stack: 2})
    vault.addArtifact({id: 'other', stack: 3})

    expect(vault.artifacts.length).toEqual(2)

    vault.restore({
        artifacts: [{id: 'custom', stack: 10}]
    })

    expect(vault.artifacts.length).toEqual(1)
    expect(vault.artifacts[0].id).toEqual('custom')
    expect(vault.artifacts[0].stack).toEqual(10)
})
