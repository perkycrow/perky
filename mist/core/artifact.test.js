import {test, expect, beforeEach} from 'vitest'
import Artifact from './artifact.js'


let artifact

beforeEach(() => {
    artifact = new Artifact({
        id:    'zealot',
        skill: 'madness',
        type:  'trigger',
        stack: 1
    })
})


test('id', () => {
    expect(artifact.id).toEqual('zealot')

    class CustomArtifact extends Artifact {}
    expect(new CustomArtifact().id).toEqual('custom')

    class OtherArtifact extends Artifact {
        static id = 'funky'
    }
    expect(new OtherArtifact().id).toEqual('funky')

    class MyFuckingArtifact extends Artifact {}
    expect(new MyFuckingArtifact().id).toEqual('myFucking')
})


test('add', () => {
    artifact.add()
    expect(artifact.stack).toEqual(2)

    artifact.add(2)
    expect(artifact.stack).toEqual(4)
})


test('trigger', () => {
    expect(artifact.trigger()).toBeTruthy()

    artifact.stack = 0
    expect(artifact.trigger()).toBeFalsy()
})
