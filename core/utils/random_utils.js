import Random from '../random.js'


export function newRandom (seed = Random.generateSeed()) {
    return new Random(seed)
}


const randomApi = newRandom()


export function random () {
    return randomApi.random()
}


export function randomBetween (min, max) {
    return randomApi.between(min, max)
}


export function randomIntBetween (min, max) {
    return randomApi.intBetween(min, max)
}


export function randomPick (array) {
    return randomApi.pick(array)
}


export function weightedChoice (choices) {
    return randomApi.weightedChoice(choices)
}
