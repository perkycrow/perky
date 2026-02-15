import Factory from '../libs/factory.js'

import Madness from '../skills/madness_skill.js'
import Ruin from '../skills/ruin_skill.js'
import Contagion from '../skills/contagion_skill.js'

const skillFactory = new Factory('Skill', [Madness, Ruin, Contagion])

export default skillFactory
