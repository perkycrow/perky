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


test('restore', () => {
    artifact.restore({
        id: 'newId',
        skill: 'newSkill',
        type: 'newType',
        stack: 5
    })

    expect(artifact.id).toEqual('newId')
    expect(artifact.skill).toEqual('newSkill')
    expect(artifact.type).toEqual('newType')
    expect(artifact.stack).toEqual(5)
})


test('restore uses class defaults', () => {
    class TestArtifact extends Artifact {
        static skill = 'defaultSkill'
        static type = 'defaultType'
        static stack = 3
    }

    const testArtifact = new TestArtifact()
    testArtifact.restore({})

    expect(testArtifact.id).toEqual('test')
    expect(testArtifact.skill).toEqual('defaultSkill')
    expect(testArtifact.type).toEqual('defaultType')
    expect(testArtifact.stack).toEqual(3)
})


test('export', () => {
    const exported = artifact.export()

    expect(exported).toEqual({
        id: 'zealot',
        skill: 'madness',
        type: 'trigger',
        stack: 1
    })
})


test('export reflects current state', () => {
    artifact.stack = 10
    artifact.skill = 'updatedSkill'

    const exported = artifact.export()

    expect(exported.stack).toEqual(10)
    expect(exported.skill).toEqual('updatedSkill')
})
