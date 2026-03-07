import fear from './fear.js'
import sadness from './sadness.js'
import anger from './anger.js'
import arrogance from './arrogance.js'
import naive from './naive.js'
import surprise from './surprise.js'
import lust from './lust.js'


export const SPORE_LIST = [fear, sadness, anger, arrogance, naive, surprise, lust]

export const SPORE_DEFINITIONS = Object.fromEntries(SPORE_LIST.map(s => [s.key, s]))
